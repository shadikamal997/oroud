import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AdPlacement } from '@prisma/client';

export class GetAdsQueryDto {
  @IsOptional()
  @IsEnum(AdPlacement)
  placement?: AdPlacement;

  @IsOptional()
  @IsString()
  cityId?: string;
}
