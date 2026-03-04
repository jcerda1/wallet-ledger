import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { ItemsModule } from './items/items.module';
import { LedgerModule } from './ledger/ledger.module';
import { PurchasesModule } from './purchases/purchases.module';
import { UuidHeaderGuard } from './common/guards/index';

@Module({
  imports: [ItemsModule, LedgerModule, PurchasesModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UuidHeaderGuard,
    },
  ],
})
export class AppModule {}
