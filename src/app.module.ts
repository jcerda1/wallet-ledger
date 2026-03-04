import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ItemsModule } from './items/items.module';
import { LedgerModule } from './ledger/ledger.module';
import { PurchasesModule } from './purchases/purchases.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ItemsModule, LedgerModule, PurchasesModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
