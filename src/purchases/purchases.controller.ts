import { Controller, Post, Body } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CurrentUserId } from '../common/decorators';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller()
export class PurchasesController {
  constructor(private readonly purchaseService: PurchasesService) {}

  @Post('purchases')
  createPurchase(
    @CurrentUserId() userId: string,
    @Body() dto: CreatePurchaseDto,
  ): Promise<void> {
    return this.purchaseService.createPurchase(userId, dto);
  }
}
