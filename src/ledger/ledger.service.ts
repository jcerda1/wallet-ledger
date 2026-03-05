import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { CreateCreditDto } from './dto/create-credit.dto';
import { Type } from '../../prisma/.generated/client';
import { getBalance } from '../../prisma/.generated/sql';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}
  async addCredit(
    userId: string,
    dto: CreateCreditDto,
  ): Promise<BalanceResponseDto> {
    await this.prisma.ledger_transactions.create({
      data: {
        user_id: userId,
        type: Type.CREDIT,
        amount: dto.amount,
      },
    });
    return this.getBalance(userId);
  }
  async getBalance(userId: string): Promise<BalanceResponseDto> {
    const results = await this.prisma.$queryRawTyped(getBalance(userId));
    return { balance: Number(results[0]?.balance ?? 0n) };
  }
}
