import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from 'generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuardService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyStadium(guardId: string) {
    const guard = await this.prisma.user.findUnique({
      where: { id: guardId },
      select: { assignedStadiumId: true },
    });

    if (!guard?.assignedStadiumId) {
      throw new BadRequestException('You are not assigned to any stadium');
    }
    return guard.assignedStadiumId;
  }

  async findAllBookings(guardId: string) {
    const stadiumId = await this.findMyStadium(guardId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.booking.findMany({
      where: {
        stadiumId,
        scheduledAt: { gte: today },
      },
      include: {
        player: {
          select: { first_name: true, last_name: true, profile_img: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async verifyToken(guardId: string, token: string) {
    const stadiumId = await this.findMyStadium(guardId);

    const booking = await this.prisma.booking.findUnique({
      where: { verificationToken: token },
      include: { stadium: true },
    });

    if (!booking) {
      throw new NotFoundException('Invalid ticket token');
    }

    if (booking.stadiumId !== stadiumId) {
      throw new BadRequestException('This ticket belongs to another stadium');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('Ticket already verified and used');
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.EXPIRED
    ) {
      throw new BadRequestException(
        `Ticket is ${booking.status.toLowerCase()}`,
      );
    }

    return this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CONFIRMED },
      include: { player: true },
    });
  }
}
