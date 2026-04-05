import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TopUpDto } from './dto/top-up.dto';
import { DeductDto } from './dto/deduct.dto';
import { TransactionType } from '../../../generated/prisma/enums';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist (Lazy creation)
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    return wallet;
  }

  async topUp(userId: string, topUpDto: TopUpDto) {
    const wallet = await this.getWallet(userId);

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: topUpDto.amount,
          },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: topUpDto.amount,
          type: TransactionType.TOP_UP,
          description: topUpDto.description || 'Wallet top up',
        },
      });

      return updatedWallet;
    });
  }

  async deduct(userId: string, deductDto: DeductDto) {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < deductDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: deductDto.amount,
          },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: deductDto.amount,
          type: TransactionType.DEDUCT,
          description: deductDto.description || 'Wallet deduction',
        },
      });

      return updatedWallet;
    });
  }

  async getTransactions(userId: string) {
    const wallet = await this.getWallet(userId);
    return this.prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
