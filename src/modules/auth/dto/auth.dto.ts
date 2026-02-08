import { IsString, IsNotEmpty, IsPhoneNumber, IsEnum, IsOptional, IsEmail, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

// Keep phone login for backward compatibility if needed
export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}
