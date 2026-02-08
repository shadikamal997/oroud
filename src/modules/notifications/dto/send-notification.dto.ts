import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class SendNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
