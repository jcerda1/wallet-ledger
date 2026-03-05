import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemsService } from '../items/items.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Type } from '@prisma/client';
import { getBalance } from '@prisma/client/sql';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly itemsService: ItemsService,
  ) {}
  async createPurchase(userId: string, dto: CreatePurchaseDto): Promise<void> {
    const item = this.itemsService.findById(dto.itemId);
    if (!item) {
      throw new NotFoundException(`Item ${dto.itemId} not found`);
    }

    const itemPrice = item.price;

    await this.prisma.$transaction(async (transaction) => {
      const rows = await transaction.$queryRawTyped(getBalance(userId));
      const balanceBigInt = rows[0].balance ?? 0n;
      const balance = Number(balanceBigInt);

      if (balance < itemPrice) {
        throw new ConflictException(`Insufficient balance.`);
      }

      const ledgerTransaction = await transaction.ledger_transactions.create({
        data: {
          user_id: userId,
          type: Type.DEBIT,
          amount: itemPrice,
        },
      });

      await transaction.purchases.create({
        data: {
          transaction_id: ledgerTransaction.id,
          item_id: item.id,
          item_price: itemPrice,
        },
      });
    });
  }
}
