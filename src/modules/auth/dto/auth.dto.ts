import { IsString, IsNotEmpty, IsPhoneNumber, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
