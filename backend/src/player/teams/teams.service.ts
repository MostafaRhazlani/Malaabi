import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RequestStatus, RequestType } from 'generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class TeamsService {
  private static readonly ONE_TEAM_MEMBERSHIP_MESSAGE =
    'You can only join one team at a time. Leave your current team before joining another.';

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    userId: string,
    createTeamDto: CreateTeamDto,
    logoFile?: Express.Multer.File,
  ) {
    const existingTeam = await this.prisma.team.findFirst({
      where: {
        OR: [{ leaderId: userId }, { members: { some: { id: userId } } }],
      },
      select: { id: true, name: true, leaderId: true },
    });

    if (existingTeam) {
      if (existingTeam.leaderId === userId) {
        throw new BadRequestException(
          `You already lead a team (${existingTeam.name}). Delete it or assign another player as leader before creating a new team.`,
        );
      } else {
        throw new BadRequestException(
          `You are already a member of team (${existingTeam.name}). Leave it before creating a new team.`,
        );
      }
    }

    let logoUrl: string | undefined;

    if (logoFile) {
      logoUrl = await this.uploadService.saveFile('teams/logos', logoFile);
    }

    const team = await this.prisma.team.create({
      data: {
        ...createTeamDto,
        logo: logoUrl,
        leaderId: userId,
        members: {
          connect: { id: userId },
        },
      },
      include: {
        leader: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true,
          },
        },
        members: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true,
          },
        },
      },
    });

    return team;
  }

  async findAll() {
    return this.prisma.team.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        isPublic: true,
        maxMembers: true,
        _count: {
          select: { members: true },
        },
        members: {
          select: { id: true },
        },
        leader: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async findMyTeams(userId: string) {
    return this.prisma.team.findMany({
      where: {
        OR: [{ leaderId: userId }, { members: { some: { id: userId } } }],
      },
      select: {
        id: true,
        name: true,
        logo: true,
        isPublic: true,
        maxMembers: true,
        leaderId: true,
        _count: {
          select: { members: true },
        },
        members: {
          select: { id: true },
        },
        leader: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async getMySentRequests(userId: string) {
    return this.prisma.teamJoinRequest.findMany({
      where: {
        playerId: userId,
        status: RequestStatus.PENDING,
        team: {
          leaderId: { not: userId },
          members: {
            none: { id: userId },
          },
        },
      },
      select: {
        id: true,
        teamId: true,
        playerId: true,
        status: true,
        type: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            isPublic: true,
            maxMembers: true,
            leader: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
            members: {
              select: { id: true },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async invitePlayer(teamId: string, playerId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { select: { id: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException('Only the team leader can recruit players');
    }

    if (playerId === leaderId) {
      throw new BadRequestException('Leader cannot recruit themselves');
    }

    const player = await this.prisma.user.findFirst({
      where: { id: playerId, role: 'PLAYER' },
      select: { id: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const playerTeam = await this.prisma.team.findFirst({
      where: {
        OR: [{ leaderId: playerId }, { members: { some: { id: playerId } } }],
      },
      select: { id: true, name: true },
    });

    if (playerTeam) {
      throw new BadRequestException(
        `Player is already a member of a team (${playerTeam.name})`,
      );
    }

    const existingRequest = await this.prisma.teamJoinRequest.findUnique({
      where: { teamId_playerId: { teamId, playerId } },
      select: { id: true, status: true, type: true },
    });

    if (existingRequest?.status === RequestStatus.PENDING) {
      if (existingRequest.type === RequestType.INVITATION) {
        throw new BadRequestException('Invitation already sent to this player');
      }

      throw new BadRequestException(
        'Player already has a pending join request for this team',
      );
    }

    if (existingRequest) {
      return this.prisma.teamJoinRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: RequestStatus.PENDING,
          type: RequestType.INVITATION,
        },
      });
    }

    return this.prisma.teamJoinRequest.create({
      data: {
        teamId,
        playerId,
        status: RequestStatus.PENDING,
        type: RequestType.INVITATION,
      },
    });
  }

  async cancelMySentRequest(requestId: string, userId: string) {
    const request = await this.prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        playerId: true,
        status: true,
        type: true,
      },
    });

    if (
      !request ||
      request.playerId !== userId ||
      request.type !== RequestType.REQUEST
    ) {
      throw new NotFoundException('Join request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    await this.prisma.teamJoinRequest.delete({
      where: { id: requestId },
    });

    return { success: true };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        maxMembers: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        leaderId: true,
        leader: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true,
            position: true,
            birth_date: true,
          },
        },
        members: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true,
            position: true,
            birth_date: true,
            teams: {
              take: 1,
              select: {
                id: true,
                name: true,
              },
            },
            ledTeams: {
              take: 1,
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Map members to include a single 'team' object for the frontend
    const mappedMembers = team.members.map((member) => {
      const { teams, ledTeams, ...rest } = member;
      return {
        ...rest,
        team: ledTeams[0] || teams[0] || null,
      };
    });

    return { ...team, members: mappedMembers };
  }

  async searchPlayers(name: string, currentUserId: string) {
    const players = await this.prisma.user.findMany({
      where: {
        role: 'PLAYER',
        id: { not: currentUserId },
        OR: [
          { first_name: { contains: name, mode: 'insensitive' } },
          { last_name: { contains: name, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        profile_img: true,
        position: true,
        birth_date: true,
        teams: {
          take: 1,
          select: {
            id: true,
            name: true,
          },
        },
        ledTeams: {
          take: 1,
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return players.map((player) => {
      const { teams, ledTeams, ...rest } = player;
      return {
        ...rest,
        team: ledTeams[0] || teams[0] || null,
      };
    });
  }

  async joinTeam(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { select: { id: true } },
        _count: { select: { members: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');

    const currentTeam = await this.prisma.team.findFirst({
      where: {
        OR: [{ leaderId: userId }, { members: { some: { id: userId } } }],
      },
      select: { id: true },
    });

    if (currentTeam && currentTeam.id !== teamId) {
      throw new BadRequestException(TeamsService.ONE_TEAM_MEMBERSHIP_MESSAGE);
    }

    const existingRequest = await this.prisma.teamJoinRequest.findUnique({
      where: { teamId_playerId: { teamId, playerId: userId } },
      select: { id: true, status: true, type: true },
    });

    const isAlreadyMember = team.members.some((m) => m.id === userId);
    if (isAlreadyMember) {
      if (existingRequest?.status === RequestStatus.PENDING) {
        await this.prisma.teamJoinRequest.update({
          where: { id: existingRequest.id },
          data: { status: RequestStatus.ACCEPTED },
        });
      }

      throw new BadRequestException('You are already a member of this team');
    }

    if (team._count.members >= team.maxMembers) {
      throw new BadRequestException(
        'This team has reached its maximum capacity',
      );
    }

    if (
      existingRequest?.status === RequestStatus.PENDING &&
      existingRequest.type === RequestType.INVITATION
    ) {
      await this.prisma.$transaction(async (tx) => {
        await tx.teamJoinRequest.update({
          where: { id: existingRequest.id },
          data: { status: RequestStatus.ACCEPTED },
        });

        await tx.team.update({
          where: { id: teamId },
          data: { members: { connect: { id: userId } } },
        });
      });

      return { success: true };
    }

    if (!team.isPublic) {
      if (existingRequest?.status === RequestStatus.PENDING) {
        throw new BadRequestException(
          'You already have a pending request for this team',
        );
      }

      if (existingRequest) {
        return this.prisma.teamJoinRequest.update({
          where: { id: existingRequest.id },
          data: {
            status: RequestStatus.PENDING,
            type: RequestType.REQUEST,
          },
        });
      }

      return this.prisma.teamJoinRequest.create({
        data: {
          teamId,
          playerId: userId,
          status: RequestStatus.PENDING,
          type: RequestType.REQUEST,
        },
      });
    }

    if (existingRequest?.status === RequestStatus.PENDING) {
      await this.prisma.teamJoinRequest.update({
        where: { id: existingRequest.id },
        data: { status: RequestStatus.ACCEPTED },
      });
    }

    return this.prisma.team.update({
      where: { id: teamId },
      data: { members: { connect: { id: userId } } },
    });
  }

  async leaveTeam(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { select: { id: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');

    if (team.leaderId === userId) {
      throw new BadRequestException(
        'Team leader cannot leave the team. Delete the team instead.',
      );
    }

    const isMember = team.members.some((member) => member.id === userId);
    if (!isMember) {
      throw new BadRequestException('You are not a member of this team');
    }

    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });

    return { success: true };
  }

  async expelMember(teamId: string, playerId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { select: { id: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException('Only the team leader can expel members');
    }

    if (playerId === leaderId) {
      throw new BadRequestException('Leader cannot expel themselves');
    }

    const isMember = team.members.some((member) => member.id === playerId);
    if (!isMember) {
      throw new NotFoundException('Player is not a member of this team');
    }

    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          disconnect: { id: playerId },
        },
      },
    });

    return { success: true };
  }

  async getTeamRequests(teamId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, leaderId: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException(
        'Only the team leader can view team requests',
      );
    }

    const requests = await this.prisma.teamJoinRequest.findMany({
      where: {
        teamId,
        status: RequestStatus.PENDING,
        type: { in: [RequestType.REQUEST, RequestType.INVITATION] },
      },
      select: {
        id: true,
        teamId: true,
        playerId: true,
        status: true,
        type: true,
        createdAt: true,
        player: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_img: true,
            position: true,
            birth_date: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return requests;
  }

  async getTeamInvitations(teamId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, leaderId: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException(
        'Only the team leader can view team invitations',
      );
    }

    const invitations = await this.prisma.teamJoinRequest.findMany({
      where: {
        teamId,
        status: RequestStatus.PENDING,
        type: RequestType.INVITATION,
      },
      select: {
        playerId: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return invitations.map((invitation) => invitation.playerId);
  }

  async acceptTeamRequest(teamId: string, playerId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { select: { id: true } },
        _count: { select: { members: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException('Only the team leader can accept requests');
    }

    const joinRequest = await this.prisma.teamJoinRequest.findUnique({
      where: { teamId_playerId: { teamId, playerId } },
      select: { id: true, status: true, type: true },
    });

    if (!joinRequest || joinRequest.type !== RequestType.REQUEST) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be accepted');
    }

    const currentPlayerTeam = await this.prisma.team.findFirst({
      where: {
        OR: [{ leaderId: playerId }, { members: { some: { id: playerId } } }],
      },
      select: { id: true },
    });

    if (currentPlayerTeam && currentPlayerTeam.id !== teamId) {
      throw new BadRequestException(
        'This player is already a member of another team and cannot be accepted.',
      );
    }

    const isAlreadyMember = team.members.some(
      (member) => member.id === playerId,
    );
    if (!isAlreadyMember && team._count.members >= team.maxMembers) {
      throw new BadRequestException(
        'This team has reached its maximum capacity',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.teamJoinRequest.update({
        where: { id: joinRequest.id },
        data: { status: RequestStatus.ACCEPTED },
      });

      if (!isAlreadyMember) {
        await tx.team.update({
          where: { id: teamId },
          data: { members: { connect: { id: playerId } } },
        });
      }
    });

    return { success: true };
  }

  async rejectTeamRequest(teamId: string, playerId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, leaderId: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException('Only the team leader can reject requests');
    }

    const joinRequest = await this.prisma.teamJoinRequest.findUnique({
      where: { teamId_playerId: { teamId, playerId } },
      select: { id: true, status: true, type: true },
    });

    if (!joinRequest || joinRequest.type !== RequestType.REQUEST) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    await this.prisma.teamJoinRequest.update({
      where: { id: joinRequest.id },
      data: { status: RequestStatus.REJECTED },
    });

    return { success: true };
  }

  async cancelRecruit(teamId: string, playerId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, leaderId: true },
    });

    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException('Only the team leader can cancel recruits');
    }

    const invitation = await this.prisma.teamJoinRequest.findUnique({
      where: { teamId_playerId: { teamId, playerId } },
      select: { id: true, type: true, status: true },
    });

    if (!invitation || invitation.type !== RequestType.INVITATION) {
      throw new NotFoundException('Recruit invitation not found');
    }

    if (invitation.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Only pending recruit invitations can be cancelled',
      );
    }

    await this.prisma.teamJoinRequest.update({
      where: { id: invitation.id },
      data: { status: RequestStatus.REJECTED },
    });

    return { success: true };
  }

  async acceptInvitation(requestId: string, userId: string) {
    const invitation = await this.prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          include: {
            members: { select: { id: true } },
            _count: { select: { members: true } },
          },
        },
      },
    });

    if (
      !invitation ||
      invitation.playerId !== userId ||
      invitation.type !== RequestType.INVITATION
    ) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be accepted');
    }

    const team = invitation.team;
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const currentPlayerTeam = await this.prisma.team.findFirst({
      where: {
        OR: [{ leaderId: userId }, { members: { some: { id: userId } } }],
      },
      select: { id: true },
    });

    if (currentPlayerTeam && currentPlayerTeam.id !== team.id) {
      throw new BadRequestException(TeamsService.ONE_TEAM_MEMBERSHIP_MESSAGE);
    }

    const isAlreadyMember = team.members.some((member) => member.id === userId);
    if (!isAlreadyMember && team._count.members >= team.maxMembers) {
      throw new BadRequestException(
        'This team has reached its maximum capacity',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.teamJoinRequest.update({
        where: { id: invitation.id },
        data: { status: RequestStatus.ACCEPTED },
      });

      if (!isAlreadyMember) {
        await tx.team.update({
          where: { id: team.id },
          data: { members: { connect: { id: userId } } },
        });
      }
    });

    return { success: true };
  }

  async rejectInvitation(requestId: string, userId: string) {
    const invitation = await this.prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        playerId: true,
        status: true,
        type: true,
      },
    });

    if (
      !invitation ||
      invitation.playerId !== userId ||
      invitation.type !== RequestType.INVITATION
    ) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be rejected');
    }

    await this.prisma.teamJoinRequest.update({
      where: { id: invitation.id },
      data: { status: RequestStatus.REJECTED },
    });

    return { success: true };
  }

  async update(
    teamId: string,
    leaderId: string,
    updateTeamDto: UpdateTeamDto,
    logoFile?: Express.Multer.File,
  ) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId)
      throw new ForbiddenException('Only the team leader can update the team');

    let logoUrl = team.logo;

    if (logoFile) {
      if (team.logo) {
        await this.uploadService.deleteFile(team.logo);
      }
      logoUrl = await this.uploadService.saveFile('teams/logos', logoFile);
    }

    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        ...updateTeamDto,
        logo: logoUrl,
      },
    });
  }

  async delete(teamId: string, leaderId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.leaderId !== leaderId)
      throw new ForbiddenException('Only the team leader can delete the team');

    if (team.logo) {
      await this.uploadService.deleteFile(team.logo);
    }

    return this.prisma.team.delete({ where: { id: teamId } });
  }
}
