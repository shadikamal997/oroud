import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { GetAdsQueryDto } from './dto/get-ads-query.dto';

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAd(dto: CreateAdDto) {
    return this.prisma.ad.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        redirectUrl: dto.redirectUrl,
        placement: dto.placement,
        cityId: dto.cityId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        priority: dto.priority ?? 0,
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateAd(id: string, dto: UpdateAdDto) {
    // Check if ad exists
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.redirectUrl !== undefined) updateData.redirectUrl = dto.redirectUrl;
    if (dto.placement !== undefined) updateData.placement = dto.placement;
    if (dto.cityId !== undefined) updateData.cityId = dto.cityId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.priority !== undefined) updateData.priority = dto.priority;

    return this.prisma.ad.update({
      where: { id },
      data: updateData,
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteAd(id: string) {
    // Check if ad exists
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    await this.prisma.ad.delete({ where: { id } });
    return { message: 'Ad deleted successfully', deletedAd: { id: ad.id, title: ad.title } };
  }

  async getActiveAds(query: GetAdsQueryDto) {
    const now = new Date();

    // Build where clause
    const whereClause: any = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (query.placement) {
      whereClause.placement = query.placement;
    }

    if (query.cityId) {
      whereClause.OR = [
        { cityId: query.cityId },
        { cityId: null }, // Include global ads (not city-specific)
      ];
    }

    const ads = await this.prisma.ad.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { startDate: 'desc' },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        redirectUrl: true,
        placement: true,
        priority: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return ads;
  }

  async getAllAds() {
    return this.prisma.ad.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
