import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all areas, optionally filtered by cityId
   */
  async findAll(cityId?: string) {
    return this.prisma.area.findMany({
      where: cityId ? { cityId } : undefined,
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Find a single area by ID
   */
  async findOne(id: string) {
    return this.prisma.area.findUnique({
      where: { id },
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        shops: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            trustScore: true,
            isPremium: true,
          },
          where: {
            isVerified: true,
          },
          take: 10,
        },
      },
    });
  }

  /**
   * Get areas grouped by city
   */
  async findGroupedByCity() {
    const cities = await this.prisma.city.findMany({
      include: {
        areas: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cities.map((city) => ({
      id: city.id,
      name: city.name,
      areas: city.areas,
    }));
  }

  /**
   * Get areas count by cityId
   */
  async getAreaCountByCity(cityId: string) {
    return this.prisma.area.count({
      where: { cityId },
    });
  }
}
