import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, IsBoolean } from 'class-validator';
import { AdPlacement } from '@prisma/client';

export class UpdateAdDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsEnum(AdPlacement)
  placement?: AdPlacement;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
