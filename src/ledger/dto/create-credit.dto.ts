import { IsInt, Min } from 'class-validator';

export class CreateCreditDto {
  @IsInt()
  @Min(1)
  amount!: number;
}
