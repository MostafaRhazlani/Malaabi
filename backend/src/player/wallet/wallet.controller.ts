import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TopUpDto } from './dto/top-up.dto';
import { DeductDto } from './dto/deduct.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('player/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@Req() req: any) {
    return this.walletService.getWallet(req.user.user_id);
  }

  @Post('top-up')
  topUp(@Req() req: any, @Body() topUpDto: TopUpDto) {
    return this.walletService.topUp(req.user.user_id, topUpDto);
  }

  @Post('deduct')
  deduct(@Req() req: any, @Body() deductDto: DeductDto) {
    return this.walletService.deduct(req.user.user_id, deductDto);
  }

  @Get('transactions')
  getTransactions(@Req() req: any) {
    return this.walletService.getTransactions(req.user.user_id);
  }
}
