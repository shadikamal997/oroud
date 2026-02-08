import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString, IsInt, Min } from 'class-validator';
import { AdPlacement } from '@prisma/client';

export class CreateAdDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsString()
  redirectUrl: string;

  @IsNotEmpty()
  @IsEnum(AdPlacement)
  placement: AdPlacement;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
