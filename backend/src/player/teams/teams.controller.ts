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
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
  import { Role } from 'generated/prisma/enums';
  import { TeamsService } from './teams.service';
  import { CreateTeamDto } from './dto/create-team.dto';
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
  
    @ApiOperation({ summary: 'Get teams where user is member or leader' })
    @Get('my-teams')
    async findMyTeams(@Req() request: Request & { user: AuthenticatedUser }) {
      return this.teamsService.findMyTeams(request.user.user_id);
    }

    @ApiOperation({ summary: 'Get a specific team by id' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.teamsService.findOne(id);
    }
  }
  
