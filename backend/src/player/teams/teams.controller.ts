import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { Request } from 'express';

@ApiTags('Player Teams')
@Controller('player/teams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLAYER)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({ summary: 'Create a new team' })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Req() request: Request & { user: AuthenticatedUser },
    @Body() createTeamDto: CreateTeamDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.teamsService.create(request.user.user_id, createTeamDto, logo);
  }

  @ApiOperation({ summary: 'Get all public teams' })
  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  @ApiOperation({ summary: 'Search for players to invite' })
  @Get('search-players')
  async searchPlayers(
    @Query('name') name: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.searchPlayers(name, request.user.user_id);
  }

  @ApiOperation({ summary: 'Get teams where user is member or leader' })
  @Get('my-teams')
  async findMyTeams(@Req() request: Request & { user: AuthenticatedUser }) {
    return this.teamsService.findMyTeams(request.user.user_id);
  }

  @ApiOperation({ summary: 'Get current player sent join requests' })
  @Get('my-requests')
  async getMySentRequests(
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.getMySentRequests(request.user.user_id);
  }

  @ApiOperation({
    summary: 'Cancel a pending join request sent by current player',
  })
  @Post('requests/:requestId/cancel')
  async cancelMySentRequest(
    @Param('requestId') requestId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.cancelMySentRequest(
      requestId,
      request.user.user_id,
    );
  }

  @ApiOperation({
    summary: 'Get pending join requests for a team (leader only)',
  })
  @Get(':id/requests')
  async getTeamRequests(
    @Param('id') id: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.getTeamRequests(id, request.user.user_id);
  }

  @ApiOperation({
    summary: 'Get pending invited players for a team (leader only)',
  })
  @Get(':id/invitations')
  async getTeamInvitations(
    @Param('id') id: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.getTeamInvitations(id, request.user.user_id);
  }

  @ApiOperation({ summary: 'Accept a pending join request (leader only)' })
  @Post(':id/requests/:playerId/accept')
  async acceptTeamRequest(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.acceptTeamRequest(
      id,
      playerId,
      request.user.user_id,
    );
  }

  @ApiOperation({ summary: 'Invite a player to join team (leader only)' })
  @Post(':id/invite/:playerId')
  async invitePlayer(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.invitePlayer(id, playerId, request.user.user_id);
  }

  @ApiOperation({
    summary: 'Cancel a pending recruit invitation (leader only)',
  })
  @Post(':id/invite/:playerId/cancel')
  async cancelRecruit(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.cancelRecruit(id, playerId, request.user.user_id);
  }

  @ApiOperation({ summary: 'Reject a pending join request (leader only)' })
  @Post(':id/requests/:playerId/reject')
  async rejectTeamRequest(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.rejectTeamRequest(
      id,
      playerId,
      request.user.user_id,
    );
  }

  @ApiOperation({ summary: 'Accept invitation sent to current player' })
  @Post('requests/:requestId/accept-invitation')
  async acceptInvitation(
    @Param('requestId') requestId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.acceptInvitation(requestId, request.user.user_id);
  }

  @ApiOperation({ summary: 'Reject invitation sent to current player' })
  @Post('requests/:requestId/reject-invitation')
  async rejectInvitation(
    @Param('requestId') requestId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.rejectInvitation(requestId, request.user.user_id);
  }

  @ApiOperation({ summary: 'Get a specific team by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @ApiOperation({ summary: 'Join a public team' })
  @Post(':id/join')
  async joinTeam(
    @Param('id') id: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.joinTeam(id, request.user.user_id);
  }

  @ApiOperation({ summary: 'Leave a team (member only)' })
  @Post(':id/leave')
  async leaveTeam(
    @Param('id') id: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.leaveTeam(id, request.user.user_id);
  }

  @ApiOperation({ summary: 'Expel a team member (leader only)' })
  @Post(':id/members/:playerId/expel')
  async expelMember(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.expelMember(id, playerId, request.user.user_id);
  }

  @ApiOperation({ summary: 'Update team details' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  @Post(':id/update')
  async update(
    @Param('id') id: string,
    @Req() request: Request & { user: AuthenticatedUser },
    @Body() updateTeamDto: UpdateTeamDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.teamsService.update(
      id,
      request.user.user_id,
      updateTeamDto,
      logo,
    );
  }

  @ApiOperation({ summary: 'Delete a team' })
  @Post(':id/delete')
  async delete(
    @Param('id') id: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.teamsService.delete(id, request.user.user_id);
  }
}
