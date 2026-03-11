import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignGuardDto } from './dto/assign-guard.dto';
import { CreateGuardDto } from './dto/create-guard.dto';

@Injectable()
export class ManagerGuardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(managerId: string) {
    return this.prisma.user.findMany({
      where: { managerId, role: Role.GUARD },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        status: true,
        createdAt: true,
        assignedStadium: { select: { id: true, name: true, city: true } },
      },
    });
  }

  async create(managerId: string, dto: CreateGuardDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        role: Role.GUARD,
        managerId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async assign(managerId: string, guardId: string, dto: AssignGuardDto) {
    const guard = await this.prisma.user.findUnique({ where: { id: guardId } });
    if (!guard || guard.role !== Role.GUARD)
      throw new NotFoundException('Guard not found');
    if (guard.managerId !== managerId)
      throw new ForbiddenException('You do not manage this guard');

    if (dto.stadiumId) {
      const stadium = await this.prisma.stadium.findUnique({
        where: { id: dto.stadiumId },
      });
      if (!stadium || stadium.managerId !== managerId)
        throw new ForbiddenException('Stadium not found or not owned by you');
    }

    return this.prisma.user.update({
      where: { id: guardId },
      data: { assignedStadiumId: dto.stadiumId },
      select: {
        id: true,
        assignedStadium: { select: { id: true, name: true } },
      },
    });
  }

  async remove(managerId: string, guardId: string) {
    const guard = await this.prisma.user.findUnique({ where: { id: guardId } });
    if (!guard || guard.role !== Role.GUARD)
      throw new NotFoundException('Guard not found');
    if (guard.managerId !== managerId)
      throw new ForbiddenException('You do not manage this guard');

    await this.prisma.user.delete({ where: { id: guardId } });
    return { deleted: true };
  }
}
