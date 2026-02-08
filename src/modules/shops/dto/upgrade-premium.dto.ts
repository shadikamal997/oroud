import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpgradePremiumDto {
  @IsNotEmpty()
  @IsString()
  shopId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Months must be at least 1' })
  @Max(12, { message: 'Months cannot exceed 12' })
  months: number;
}
