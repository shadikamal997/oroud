import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Environment variables interface
 */
export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  API_PREFIX: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  CORS_ORIGINS: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

/**
 * Configuration validation service
 */
@Injectable()
export class ConfigValidationService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  /**
   * Validate required environment variables
   * Throws error if any critical variable is missing
   */
  validateConfig(): void {
    const requiredVars: (keyof EnvironmentVariables)[] = [
      'DATABASE_URL',
      'JWT_SECRET',
    ];

    const missingVars = requiredVars.filter(
      (varName) => !this.configService.get(varName)
    );

    if (missingVars.length > 0) {
      const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please check your .env file and ensure all required variables are set.`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Warn about Cloudinary if not configured
    const cloudinaryVars: (keyof EnvironmentVariables)[] = [
      'CLOUDINARY_CLOUD_NAME', 
      'CLOUDINARY_API_KEY', 
      'CLOUDINARY_API_SECRET'
    ];
    const missingCloudinary = cloudinaryVars.filter(
      (varName) => !this.configService.get(varName)
    );

    if (missingCloudinary.length > 0) {
      console.warn(
        `⚠️  WARNING: Cloudinary not fully configured. Missing: ${missingCloudinary.join(', ')}\n` +
        `Image upload functionality will not work until configured.`
      );
    }

    // Log environment info
    const env = this.configService.get('NODE_ENV') || 'development';
    const port = this.configService.get('PORT') || 3000;
    
    console.log(`✅ Environment: ${env}`);
    console.log(`✅ Port: ${port}`);
    console.log(`✅ Configuration validated successfully`);
  }
}

/**
 * Load environment file based on NODE_ENV
 */
export function getEnvFilePath(): string {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return '.env.production';
    case 'test':
      return '.env.test';
    case 'development':
    default:
      return '.env.development';
  }
}

/**
 * Configuration factory for ConfigModule
 */
export const configModuleOptions = {
  isGlobal: true,
  envFilePath: [getEnvFilePath(), '.env'], // Try specific env file first, then fallback to .env
  validate: (config: Record<string, any>) => {
    // Validate critical environment variables at startup
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    
    for (const varName of requiredVars) {
      if (!config[varName]) {
        throw new Error(
          `Missing required environment variable: ${varName}\n` +
          `Please check your environment configuration.`
        );
      }
    }

    return config;
  },
};
