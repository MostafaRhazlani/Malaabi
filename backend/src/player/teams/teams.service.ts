import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(userId: string, createTeamDto: CreateTeamDto, logoFile?: Express.Multer.File) {
    let logoUrl: string | undefined;

    if (logoFile) {
      const saved = await this.uploadService.saveFiles('teams/logos', [logoFile]);
      logoUrl = saved[0];
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
      include: {
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
        OR: [
          { leaderId: userId },
          { members: { some: { id: userId } } },
        ],
      },
      include: {
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

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
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
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }
}
