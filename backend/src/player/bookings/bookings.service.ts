import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  TransactionType,
  BookingStatus,
  StadiumStatus,
  MatchType,
} from 'generated/prisma/enums';

@Injectable()
export class PlayerBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async settleNoShowForHalfMatches() {
    const expiryWindowMs = 15 * 60 * 1000;
    const cutoff = new Date(Date.now() - expiryWindowMs);

    // Expire pending bookings that passed the grace period.
    await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.PENDING,
        scheduledAt: { lt: cutoff },
      },
      data: { status: BookingStatus.EXPIRED },
    });

    // Refund HALF bookings that were confirmed while their opponent expired.
    const confirmedHalfBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        matchType: MatchType.HALF,
        scheduledAt: { lt: cutoff },
      },
      select: {
        id: true,
        playerId: true,
        totalAmount: true,
        stadiumId: true,
        scheduledAt: true,
      },
    });

    for (const myBooking of confirmedHalfBookings) {
      const partnerBooking = await this.prisma.booking.findFirst({
        where: {
          stadiumId: myBooking.stadiumId,
          scheduledAt: myBooking.scheduledAt,
          id: { not: myBooking.id },
          status: BookingStatus.EXPIRED,
        },
        select: { id: true },
      });

      if (!partnerBooking) continue;

      const wallet = await this.prisma.wallet.findUnique({
        where: { userId: myBooking.playerId },
        select: { id: true },
      });

      if (!wallet) continue;

      const refundReason = `No-Show Compensation for Match ${myBooking.id}`;

      const alreadyRefunded = await this.prisma.transaction.findFirst({
        where: { walletId: wallet.id, description: refundReason },
        select: { id: true },
      });

      if (alreadyRefunded) continue;

      await this.prisma.$transaction([
        this.prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: myBooking.totalAmount } },
        }),
        this.prisma.transaction.create({
          data: {
            walletId: wallet.id,
            amount: myBooking.totalAmount,
            type: TransactionType.REFUND,
            description: refundReason,
          },
        }),
      ]);
    }
  }

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { stadiumId, scheduledAt, matchType } = createBookingDto;

    // 1. Find stadium and its pricing
    const stadium = await this.prisma.stadium.findUnique({
      where: { id: stadiumId, status: StadiumStatus.ACTIVE },
    });

    if (!stadium) {
      throw new NotFoundException('Stadium not found or not active');
    }

    const price =
      matchType === MatchType.FULL
        ? stadium.priceFullMatch
        : stadium.priceHalfMatch;

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
          status: { not: BookingStatus.CANCELLED },
        },
      });

      if (conflictingBooking) {
        throw new BadRequestException(
          'You already have a booking at this time in another stadium',
        );
      }

      // 5. Stadium Availability Check
      const stadiumBookings = await tx.booking.findMany({
        where: {
          stadiumId,
          scheduledAt: new Date(scheduledAt),
          status: { not: BookingStatus.CANCELLED },
        },
      });

      const isFullTaken = stadiumBookings.some(
        (b) => b.matchType === MatchType.FULL,
      );
      const halfCount = stadiumBookings.filter(
        (b) => b.matchType === MatchType.HALF,
      ).length;

      if (isFullTaken) {
        throw new BadRequestException(
          'Stadium is already fully booked for this time',
        );
      }

      if (matchType === MatchType.FULL && halfCount > 0) {
        throw new BadRequestException(
          'Stadium is partially booked, only half-match is available',
        );
      }

      if (matchType === MatchType.HALF && halfCount >= 2) {
        throw new BadRequestException(
          'Stadium is already fully booked for this time',
        );
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
          status: BookingStatus.PENDING,
        },
      });
    });
  }

  async findAll(userId: string) {
    await this.settleNoShowForHalfMatches();

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

  async getTakenSlots(
    stadiumId: string,
    date?: string,
    startDate?: string,
    endDate?: string,
  ) {
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
      throw new BadRequestException(
        'Either date or (startDate and endDate) must be provided',
      );
    }

    const slots = await this.prisma.booking.findMany({
      where: {
        stadiumId,
        scheduledAt: {
          gte: start,
          lte: end,
        },
        status: { not: BookingStatus.CANCELLED },
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

  async cancel(userId: string, bookingId: string) {
    const now = new Date();
    const fourHoursInMs = 4 * 60 * 60 * 1000;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId, playerId: userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!booking.scheduledAt) {
      throw new BadRequestException('Booking has no scheduled date');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }

    if (now >= booking.scheduledAt) {
      throw new BadRequestException(
        'Cannot cancel a match that has already started',
      );
    }

    // Determine refund percentage
    const timeDiff = booking.scheduledAt.getTime() - now.getTime();
    const isLateCancellation = timeDiff < fourHoursInMs;
    const refundPercentage = isLateCancellation ? 0.5 : 1.0;
    const refundAmount = booking.totalAmount * refundPercentage;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      // 2. Refund Wallet
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (wallet) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: refundAmount } },
        });

        // 3. Create Refund Transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: refundAmount,
            type: TransactionType.REFUND,
            description: `Refund for Match #${bookingId.slice(0, 8)} (${isLateCancellation ? '50% Late' : '100% Advance'} Cancellation)`,
          },
        });
      }

      return {
        message: 'Booking cancelled successfully',
        refundAmount,
        refundPercentage: refundPercentage * 100,
        booking: updatedBooking,
      };
    });
  }
}
