import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ItemsModule } from './items/items.module';
import { LedgerModule } from './ledger/ledger.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [ItemsModule, LedgerModule, PurchasesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
