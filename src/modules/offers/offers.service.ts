import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { TrustService } from '../shops/trust.service';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trustService: TrustService,
  ) {}

  async findAll(shopId?: string, isActive?: boolean) {
    const now = new Date();
    const offersRaw = await this.prisma.offer.findMany({
      where: {
        ...(shopId && { shopId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        shop: {
          include: {
            city: true,
            area: true,
          },
        },
      },
    });

    // Transform response to exclude premiumUntil and add isPremium
    return offersRaw.map(offer => {
      const { premiumUntil, userId, ...shopWithoutSensitive } = offer.shop;
      return {
        ...offer,
        shop: {
          ...shopWithoutSensitive,
          isPremium: premiumUntil ? premiumUntil > now : false,
        },
      };
    });
  }

  async findOne(id: string) {
    const now = new Date();
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        shop: {
          include: {
            city: true,
            area: true,
          },
        },
      },
    });

    if (!offer) {
      return null;
    }

    // Transform response to exclude premiumUntil and add isPremium
    const { premiumUntil, userId, ...shopWithoutSensitive } = offer.shop;
    return {
      ...offer,
      shop: {
        ...shopWithoutSensitive,
        isPremium: premiumUntil ? premiumUntil > now : false,
      },
    };
  }

  async create(userId: string, createOfferDto: CreateOfferDto) {
    // Validate business rules
    this.validateOfferData(createOfferDto);

    // Get shop associated with user
    const shop = await this.prisma.shop.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!shop) {
      throw new ForbiddenException('You must have a shop to create offers');
    }

    // Check if shop owner is active
    if (!shop.user.isActive) {
      throw new ForbiddenException('Cannot create offers for inactive account');
    }

    // Check trust score requirement
    const trustCheck = await this.trustService.canCreateOffers(shop.id);
    if (!trustCheck.allowed) {
      throw new ForbiddenException(trustCheck.reason || 'Cannot create offers');
    }

    // Calculate discount percentage
    const discountPercentage = 
      ((createOfferDto.originalPrice - createOfferDto.discountedPrice) / 
       createOfferDto.originalPrice) * 100;

    // Check if suspicious (discount > 80%)
    const isSuspicious = discountPercentage > 80;

    // Create offer with analytics in transaction
    const offer = await this.prisma.$transaction(async (prisma) => {
      const newOffer = await prisma.offer.create({
        data: {
          shopId: shop.id,
          title: createOfferDto.title,
          description: createOfferDto.description,
          originalPrice: createOfferDto.originalPrice,
          discountedPrice: createOfferDto.discountedPrice,
          discountPercentage,
          imageUrl: createOfferDto.imageUrl,
          expiryDate: new Date(createOfferDto.expiryDate),
          isActive: true,
          isSuspicious,
          reportCount: 0,
        },
        include: {
          shop: {
            include: {
              city: true,
              area: true,
            },
          },
        },
      });

      // Auto-create analytics record
      await prisma.offerAnalytics.create({
        data: {
          offerId: newOffer.id,
        },
      });

      return newOffer;
    });

    // Decrease trust score if offer is suspicious
    if (isSuspicious) {
      await this.trustService.decreaseForSuspiciousOffer(shop.id, offer.id);
    }

    return offer;
  }

  async update(id: string, data: any) {
    return this.prisma.offer.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.offer.delete({
      where: { id },
    });
  }

  async getActiveOffers() {
    const now = new Date();
    const offersRaw = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        expiryDate: { gte: now },
      },
      orderBy: [
        { isSuspicious: 'asc' },
        { reportCount: 'asc' },
        { expiryDate: 'asc' },
      ],
      include: {
        shop: {
          include: {
            city: true,
            area: true,
          },
        },
      },
    });

    // Transform response to exclude premiumUntil and add isPremium
    return offersRaw.map(offer => {
      const { premiumUntil, userId, ...shopWithoutSensitive } = offer.shop;
      return {
        ...offer,
        shop: {
          ...shopWithoutSensitive,
          isPremium: premiumUntil ? premiumUntil > now : false,
        },
      };
    });
  }

  async getOffersFeed(query: FeedQueryDto) {
    const now = new Date();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      expiryDate: { gte: now },
      shop: {
        trustScore: { gte: 30 },
      },
    };

    // Add location filters
    if (query.cityId) {
      where.shop.cityId = query.cityId;
    }

    if (query.areaId) {
      where.shop.areaId = query.areaId;
    }

    // Add discount filters
    if (query.minDiscount !== undefined) {
      where.discountPercentage = { ...where.discountPercentage, gte: query.minDiscount };
    }

    if (query.maxDiscount !== undefined) {
      where.discountPercentage = { ...where.discountPercentage, lte: query.maxDiscount };
    }

    // Get total count and data in parallel
    const [total, offersRaw] = await Promise.all([
      this.prisma.offer.count({ where }),
      this.prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isSuspicious: 'asc' },
          { reportCount: 'asc' },
          { shop: { trustScore: 'desc' } },
          { discountPercentage: 'desc' },
          { expiryDate: 'asc' },
        ],
        select: {
          id: true,
          title: true,
          description: true,
          originalPrice: true,
          discountedPrice: true,
          discountPercentage: true,
          imageUrl: true,
          expiryDate: true,
          isSuspicious: true,
          reportCount: true,
          createdAt: true,
          shop: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              trustScore: true,
              premiumUntil: true, // Keep for computation, will exclude in output
              isVerified: true,
              latitude: true,
              longitude: true,
              city: {
                select: {
                  id: true,
                  name: true,
                },
              },
              area: {
                select: {
                  id: true,
                  name: true,
                  zone: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Sort by premium status (computed dynamically) first, then by other criteria
    const offers = offersRaw
      .map(offer => {
        const { premiumUntil, ...shopWithoutPremium } = offer.shop;
        return {
          ...offer,
          shop: {
            ...shopWithoutPremium,
            isPremium: premiumUntil ? premiumUntil > now : false,
          },
        };
      })
      .sort((a, b) => {
        // Sort by premium status first
        if (a.shop.isPremium !== b.shop.isPremium) {
          return b.shop.isPremium ? 1 : -1;
        }
        // Then by suspicious
        if (a.isSuspicious !== b.isSuspicious) {
          return a.isSuspicious ? 1 : -1;
        }
        // Then by report count
        if (a.reportCount !== b.reportCount) {
          return a.reportCount - b.reportCount;
        }
        // Then by trust score
        if (a.shop.trustScore !== b.shop.trustScore) {
          return b.shop.trustScore - a.shop.trustScore;
        }
        // Then by discount percentage
        if (a.discountPercentage !== b.discountPercentage) {
          return b.discountPercentage - a.discountPercentage;
        }
        // Finally by expiry date
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });

    return {
      data: offers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  private validateOfferData(dto: CreateOfferDto): void {
    // Validate originalPrice > 0
    if (dto.originalPrice <= 0) {
      throw new BadRequestException('Original price must be greater than 0');
    }

    // Validate discountedPrice < originalPrice
    if (dto.discountedPrice >= dto.originalPrice) {
      throw new BadRequestException('Discounted price must be less than original price');
    }

    // Validate expiryDate
    const expiryDate = new Date(dto.expiryDate);
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);

    if (expiryDate <= now) {
      throw new BadRequestException('Expiry date must be in the future');
    }

    if (expiryDate > maxDate) {
      throw new BadRequestException('Expiry date cannot exceed 30 days from today');
    }
  }

  async trackView(offerId: string) {
    // Check if offer exists
    const offer = await this.prisma.offer.findUnique({ 
      where: { id: offerId },
      select: { id: true, shopId: true },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Increment views (create analytics if doesn't exist)
    const analytics = await this.prisma.offerAnalytics.upsert({
      where: { offerId },
      update: { views: { increment: 1 } },
      create: { offerId, views: 1 },
      select: { views: true },
    });

    // Check for trust bonus (100 views)
    if (analytics.views >= 100) {
      await this.trustService.increaseForHighViews(offer.shopId, offerId);
    }

    return { message: 'View tracked successfully' };
  }

  async trackSave(offerId: string, userId: string) {
    // Check if offer exists
    const offer = await this.prisma.offer.findUnique({ 
      where: { id: offerId },
      select: { id: true, shopId: true },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check if user already saved this offer
    const existingSave = await this.prisma.savedOffer.findUnique({
      where: {
        userId_offerId: { userId, offerId },
      },
    });

    if (existingSave) {
      throw new BadRequestException('You have already saved this offer');
    }

    // Create saved offer record and increment saves count in transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      await prisma.savedOffer.create({
        data: { userId, offerId },
      });
      
      return await prisma.offerAnalytics.upsert({
        where: { offerId },
        update: { saves: { increment: 1 } },
        create: { offerId, saves: 1 },
        select: { saves: true },
      });
    });

    // Check for trust bonus (20 saves)
    if (result.saves >= 20) {
      await this.trustService.increaseForHighSaves(offer.shopId, offerId);
    }

    return { message: 'Offer saved successfully' };
  }

  async trackClick(offerId: string) {
    // Check if offer exists
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Increment clicks (create analytics if doesn't exist)
    await this.prisma.offerAnalytics.upsert({
      where: { offerId },
      update: { clicks: { increment: 1 } },
      create: { offerId, clicks: 1 },
    });

    return { message: 'Click tracked successfully' };
  }
}
