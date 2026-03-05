import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ItemsModule } from 'src/items/items.module';

@Module({
  imports: [PrismaModule, ItemsModule],
  providers: [PurchasesService],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
