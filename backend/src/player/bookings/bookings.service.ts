import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TransactionType } from 'generated/prisma/enums';

@Injectable()
export class PlayerBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    console.log('--- CREATE BOOKING REQUEST ---');
    console.log('User ID:', userId);
    console.log('Payload:', createBookingDto);
    const { stadiumId, scheduledAt, matchType } = createBookingDto;

    // 1. Find stadium and its pricing
    const stadium = await this.prisma.stadium.findUnique({
      where: { id: stadiumId, status: 'ACTIVE' },
    });

    if (!stadium) {
      throw new NotFoundException('Stadium not found or not active');
    }

    const price = matchType === 'FULL' ? stadium.priceFullMatch : stadium.priceHalfMatch;

    if (new Date(scheduledAt).getTime() < new Date().getTime()) {
      throw new BadRequestException('Cannot book a time in the past');
    }

    // 2. Start transaction
    return this.prisma.$transaction(async (tx) => {
      // 3. Find user wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet || wallet.balance < price) {
        throw new BadRequestException('Insufficient balance');
      }

      // 4. Double Booking Check (Task 4.3)
      // Check if user has any reservation at the same exact time
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          playerId: userId,
          scheduledAt: new Date(scheduledAt),
          status: { not: 'CANCELLED' }
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException('You already have a booking at this time in another stadium');
      }

      // 5. Stadium Availability Check
      const stadiumBookings = await tx.booking.findMany({
        where: {
          stadiumId,
          scheduledAt: new Date(scheduledAt),
          status: { not: 'CANCELLED' }
        }
      });

      const isFullTaken = stadiumBookings.some(b => b.matchType === 'FULL');
      const halfCount = stadiumBookings.filter(b => b.matchType === 'HALF').length;

      if (isFullTaken) {
        throw new BadRequestException('Stadium is already fully booked for this time');
      }

      if (matchType === 'FULL' && halfCount > 0) {
        throw new BadRequestException('Stadium is partially booked, only half-match is available');
      }

      if (matchType === 'HALF' && halfCount >= 2) {
        throw new BadRequestException('Stadium is already fully booked for this time');
      }

      // 6. Update wallet balance
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: price } },
      });

      // 6. Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: price,
          type: TransactionType.PAYMENT,
          description: `Booking payment for ${stadium.name}`,
        },
      });

      // 7. Create booking record
      return tx.booking.create({
        data: {
          totalAmount: price,
          matchType,
          scheduledAt: new Date(scheduledAt),
          playerId: userId,
          stadiumId: stadiumId,
          status: 'PENDING',
        },
      });
    });
  }

  async findAll(userId: string) {
    return this.prisma.booking.findMany({
      where: { playerId: userId },
      include: {
        stadium: {
          select: {
            name: true,
            city: true,
            images: true,
            address: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getTakenSlots(stadiumId: string, date?: string, startDate?: string, endDate?: string) {
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else {
      throw new BadRequestException('Either date or (startDate and endDate) must be provided');
    }

    const slots = await this.prisma.booking.findMany({
      where: {
        stadiumId,
        scheduledAt: {
          gte: start,
          lte: end,
        },
        status: { not: 'CANCELLED' },
      },
      select: {
        scheduledAt: true,
        matchType: true,
      },
    });

    return {
      slots,
      currentTime: new Date().toISOString(),
    };
  }
}
