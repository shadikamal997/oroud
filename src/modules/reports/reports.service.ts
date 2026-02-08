import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: Implement report service methods
  async findAll() {
    return this.prisma.report.findMany({
      include: {
        offer: {
          include: {
            shop: true,
          },
        },
        user: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        offer: {
          include: {
            shop: true,
          },
        },
        user: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.report.create({
      data,
      include: {
        offer: {
          include: {
            shop: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.report.findUnique({
      where: { id },
    });
  }

  async getShopReports(shopId: string) {
    return this.prisma.report.findMany({
      where: {
        offer: {
          shopId,
        },
      },
      include: {
        offer: true,
        user: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
    });
  }
}
