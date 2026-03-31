import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TransactionType, BookingStatus, StadiumStatus, MatchType } from 'generated/prisma/enums';

@Injectable()
export class PlayerBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { stadiumId, scheduledAt, matchType } = createBookingDto;

    // 1. Find stadium and its pricing
    const stadium = await this.prisma.stadium.findUnique({
      where: { id: stadiumId, status: StadiumStatus.ACTIVE },
    });

    if (!stadium) {
      throw new NotFoundException('Stadium not found or not active');
    }

    const price = matchType === MatchType.FULL ? stadium.priceFullMatch : stadium.priceHalfMatch;

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
          status: { not: BookingStatus.CANCELLED }
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
          status: { not: BookingStatus.CANCELLED }
        }
      });

      const isFullTaken = stadiumBookings.some(b => b.matchType === MatchType.FULL);
      const halfCount = stadiumBookings.filter(b => b.matchType === MatchType.HALF).length;

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
          status: BookingStatus.PENDING,
        },
      });
    });
  }

  async findAll(userId: string) {
    const now = new Date();
    const expiryWindow = 15 * 60 * 1000; // 15 mins in ms

    // 1. Auto-expire old pending bookings (past 15 mins)
    await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.PENDING,
        scheduledAt: { lt: new Date(now.getTime() - expiryWindow) },
      },
      data: { status: BookingStatus.EXPIRED },
    });

    // 2. Compensation Logic:
    // If user is CONFIRMED for a HALF match, but their partner is EXPIRED (No-Show)
    // We give them a 50% refund for the inconvenience. 
    // We only trigger this once by checking if a refund transaction exists.
    
    // Find half-matches where this user was CONFIRMED
    const confirmedHalfBookings = await this.prisma.booking.findMany({
      where: {
        playerId: userId,
        status: BookingStatus.CONFIRMED,
        matchType: MatchType.HALF,
      },
    });

    for (const myBooking of confirmedHalfBookings) {
      // Find if there was an EXPIRED partner for this slot
      const partnerBooking = await this.prisma.booking.findFirst({
        where: {
          stadiumId: myBooking.stadiumId,
          scheduledAt: myBooking.scheduledAt,
          id: { not: myBooking.id },
          status: BookingStatus.EXPIRED,
        }
      });

      if (partnerBooking) {
        // Check if we already refunded for this booking to avoid duplicates
        const refundReason = `No-Show Compensation for Match ${myBooking.id}`;
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        
        if (wallet) {
          const alreadyRefunded = await this.prisma.transaction.findFirst({
            where: { walletId: wallet.id, description: refundReason }
          });

          if (!alreadyRefunded) {
             const refundAmount = myBooking.totalAmount * 0.5; // 50% Refund
             
             await this.prisma.$transaction([
                this.prisma.wallet.update({
                   where: { id: wallet.id },
                   data: { balance: { increment: refundAmount } }
                }),
                this.prisma.transaction.create({
                   data: {
                      walletId: wallet.id,
                      amount: refundAmount,
                      type: TransactionType.REFUND,
                      description: refundReason
                   }
                })
             ]);
             console.log(`Refunded ${refundAmount} DH to user ${userId} for no-show opponent.`);
          }
        }
      }
    }

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
}
