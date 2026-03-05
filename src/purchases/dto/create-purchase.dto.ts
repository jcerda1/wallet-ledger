import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePurchaseDto {
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;
}
