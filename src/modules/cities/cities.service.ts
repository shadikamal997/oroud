import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: Implement city service methods
  async findAll() {
    return this.prisma.city.findMany({
      include: {
        areas: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.city.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.city.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.city.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.city.delete({
      where: { id },
    });
  }

  async getCityShops(cityId: string) {
    return this.prisma.shop.findMany({
      where: { cityId },
      include: {
        area: true,
        offers: {
          where: {
            isActive: true,
          },
        },
      },
    });
  }
}
