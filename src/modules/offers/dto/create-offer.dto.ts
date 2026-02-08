import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Original price must be greater than 0' })
  originalPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Discounted price must be greater than 0' })
  discountedPrice: number;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  expiryDate: string;
}
