import { Body, Controller, Get, Post } from '@nestjs/common';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { CurrentUserId } from '../common/decorators/index';
import { CreateCreditDto } from './dto/create-credit.dto';
import { LedgerService } from './ledger.service';

@Controller()
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post('credits')
  async addCredit(
    @CurrentUserId() userId: string,
    @Body() dto: CreateCreditDto,
  ): Promise<BalanceResponseDto> {
    return this.ledgerService.addCredit(userId, dto);
  }

  @Get('balance')
  async getBalance(
    @CurrentUserId() userId: string,
  ): Promise<BalanceResponseDto> {
    return this.ledgerService.getBalance(userId);
  }
}
