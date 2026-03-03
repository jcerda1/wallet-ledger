import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { LedgerModule } from './ledger/ledger.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [ItemsModule, LedgerModule, PurchasesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
