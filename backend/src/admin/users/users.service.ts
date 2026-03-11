import * as crypto from 'crypto';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/client';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateManagerDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(query: GetUsersDto, excludeId?: string) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(excludeId && { id: { not: excludeId } }),
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: { id: true, status: true },
    });
  }

  async deleteUser(id: string, requesterId: string) {
    if (id === requesterId)
      throw new ConflictException('You cannot delete your own account');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
    return { id };
  }

  async createManager(dto: CreateManagerDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const rawPassword = this.generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await this.emailService.sendManagerCredentials(
      dto.email,
      dto.firstName,
      rawPassword,
    );

    const manager = await this.prisma.user.create({
      data: {
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        role: Role.MANAGER,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return manager;
  }

  private generatePassword(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    return Array.from(
      { length: 12 },
      () => chars[crypto.randomInt(0, chars.length)],
    ).join('');
  }
}
