import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login with phone number. If user doesn't exist, create automatically.
   */
  async login(phone: string) {
    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Auto-create user with USER role
      user = await this.prisma.user.create({
        data: {
          phone,
          role: UserRole.USER,
          isActive: true,
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Generate JWT token
    const token = await this.generateAccessToken({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }

  /**
   * Generate JWT access token
   */
  async generateAccessToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
