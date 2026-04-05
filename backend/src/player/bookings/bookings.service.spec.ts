import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../prisma/prisma.service';
import { PlayerBookingsService } from './bookings.service';
import {
  BookingStatus,
  MatchType,
  StadiumStatus,
  TransactionType,
} from 'generated/prisma/enums';
import { CreateBookingDto } from './dto/create-booking.dto';

type WalletRecord = {
  id: string;
  userId: string;
  balance: number;
};

type StadiumRecord = {
  id: string;
  name: string;
  status: StadiumStatus;
  priceFullMatch: number;
  priceHalfMatch: number;
};

type BookingRecord = {
  id: string;
  totalAmount: number;
  matchType: MatchType;
  scheduledAt: Date;
  playerId: string;
  stadiumId: string;
  status: BookingStatus;
};

type TxClient = {
  wallet: {
    findUnique: jest.MockedFunction<
      (args: { where: { userId: string } }) => Promise<WalletRecord | null>
    >;
    update: jest.MockedFunction<(args: unknown) => Promise<unknown>>;
  };
  booking: {
    findFirst: jest.MockedFunction<(args: unknown) => Promise<unknown>>;
    findMany: jest.MockedFunction<
      (args: unknown) => Promise<Array<{ matchType: MatchType }>>
    >;
    create: jest.MockedFunction<
      (args: {
        data: {
          totalAmount: number;
          matchType: MatchType;
          scheduledAt: Date;
          playerId: string;
          stadiumId: string;
          status: BookingStatus;
        };
      }) => Promise<BookingRecord>
    >;
  };
  transaction: {
    create: jest.MockedFunction<(args: unknown) => Promise<unknown>>;
  };
};

describe('PlayerBookingsService', () => {
  let service: PlayerBookingsService;

  const findStadiumMock: jest.MockedFunction<
    (args: {
      where: { id: string; status: StadiumStatus };
    }) => Promise<StadiumRecord | null>
  > = jest.fn();

  const transactionRunnerMock: jest.MockedFunction<
    (callback: (tx: TxClient) => Promise<unknown>) => Promise<unknown>
  > = jest.fn();

  const txMock: TxClient = {
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
  };

  const prismaMock = {
    stadium: {
      findUnique: findStadiumMock,
    },
    $transaction: transactionRunnerMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerBookingsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PlayerBookingsService>(PlayerBookingsService);

    jest.clearAllMocks();

    transactionRunnerMock.mockImplementation(
      async (callback: (tx: TxClient) => Promise<unknown>) => callback(txMock),
    );
  });

  it('books a stadium for player and decreases wallet amount', async () => {
    const userId = 'player-1';
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);

    const dto: CreateBookingDto = {
      stadiumId: 'stadium-1',
      scheduledAt: scheduledAt.toISOString(),
      matchType: MatchType.FULL,
    };

    const stadiumPrice = 150;
    const initialBalance = 500;

    findStadiumMock.mockResolvedValue({
      id: dto.stadiumId,
      name: 'Malaabi Stadium',
      status: StadiumStatus.ACTIVE,
      priceFullMatch: stadiumPrice,
      priceHalfMatch: 80,
    });

    txMock.wallet.findUnique.mockResolvedValue({
      id: 'wallet-1',
      userId,
      balance: initialBalance,
    });

    txMock.booking.findFirst.mockResolvedValue(null);
    txMock.booking.findMany.mockResolvedValue([]);
    txMock.wallet.update.mockResolvedValue({});
    txMock.transaction.create.mockResolvedValue({});

    const bookingResult: BookingRecord = {
      id: 'booking-1',
      totalAmount: stadiumPrice,
      matchType: MatchType.FULL,
      scheduledAt,
      playerId: userId,
      stadiumId: dto.stadiumId,
      status: BookingStatus.PENDING,
    };

    txMock.booking.create.mockResolvedValue(bookingResult);

    const result = await service.create(userId, dto);

    expect(prismaMock.stadium.findUnique).toHaveBeenCalledWith({
      where: { id: dto.stadiumId, status: StadiumStatus.ACTIVE },
    });

    expect(txMock.wallet.update).toHaveBeenCalledWith({
      where: { userId },
      data: { balance: { decrement: stadiumPrice } },
    });

    expect(txMock.transaction.create).toHaveBeenCalledWith({
      data: {
        walletId: 'wallet-1',
        amount: stadiumPrice,
        type: TransactionType.PAYMENT,
        description: 'Booking payment for Malaabi Stadium',
      },
    });

    expect(txMock.booking.create).toHaveBeenCalledWith({
      data: {
        totalAmount: stadiumPrice,
        matchType: MatchType.FULL,
        scheduledAt,
        playerId: userId,
        stadiumId: dto.stadiumId,
        status: BookingStatus.PENDING,
      },
    });

    expect(result).toEqual(bookingResult);
  });
});
