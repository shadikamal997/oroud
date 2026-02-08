import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum TrustChangeReason {
  SUSPICIOUS_OFFER = 'suspicious_offer_created',
  AUTO_HIDDEN_OFFER = 'offer_auto_hidden',
  ADMIN_DELETE_OFFER = 'admin_deleted_offer',
  HIGH_VIEWS_BONUS = 'high_views_bonus',
  HIGH_SAVES_BONUS = 'high_saves_bonus',
}

@Injectable()
export class TrustService {
  private readonly logger = new Logger(TrustService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Adjust shop trust score with validation and logging
   * @param shopId - Shop ID
   * @param change - Amount to change (positive or negative)
   * @param reason - Reason for the change
   * @param relatedEntityId - Optional related entity ID (e.g., offer ID)
   */
  async adjustTrustScore(
    shopId: string,
    change: number,
    reason: TrustChangeReason | string,
    relatedEntityId?: string,
  ): Promise<{ newScore: number; blocked: boolean }> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!shop) {
      throw new Error(`Shop not found: ${shopId}`);
    }

    // Calculate new score with bounds (0-100)
    const currentScore = shop.trustScore;
    let newScore = currentScore + change;
    newScore = Math.max(0, Math.min(100, newScore)); // Cap between 0 and 100

    const actualChange = newScore - currentScore;

    // Update shop trust score
    await this.prisma.shop.update({
      where: { id: shopId },
      data: { trustScore: newScore },
    });

    // Log the trust change in AdminLog
    await this.prisma.adminLog.create({
      data: {
        action: `trust_score_change`,
        entityType: 'shop',
        entityId: shopId,
        // Store metadata as JSON string
      },
    });

    this.logger.log(
      `Trust score adjusted for shop ${shopId}: ${currentScore} → ${newScore} (${actualChange >= 0 ? '+' : ''}${actualChange}) - Reason: ${reason}`,
    );

    // Auto-block shop if trust score < 15
    let blocked = false;
    if (newScore < 15 && shop.user.isActive) {
      await this.prisma.user.update({
        where: { id: shop.user.id },
        data: { isActive: false },
      });

      // Log the blocking action
      await this.prisma.adminLog.create({
        data: {
          action: 'auto_block_shop',
          entityType: 'shop',
          entityId: shopId,
        },
      });

      this.logger.warn(
        `Shop ${shopId} auto-blocked due to low trust score (${newScore})`,
      );
      blocked = true;
    }

    return { newScore, blocked };
  }

  /**
   * Decrease trust score for suspicious offer creation
   */
  async decreaseForSuspiciousOffer(shopId: string, offerId: string): Promise<void> {
    await this.adjustTrustScore(
      shopId,
      -2,
      TrustChangeReason.SUSPICIOUS_OFFER,
      offerId,
    );
  }

  /**
   * Decrease trust score for auto-hidden offer
   */
  async decreaseForAutoHiddenOffer(shopId: string, offerId: string): Promise<void> {
    await this.adjustTrustScore(
      shopId,
      -5,
      TrustChangeReason.AUTO_HIDDEN_OFFER,
      offerId,
    );
  }

  /**
   * Decrease trust score for admin-deleted offer
   */
  async decreaseForAdminDelete(shopId: string, offerId: string): Promise<void> {
    await this.adjustTrustScore(
      shopId,
      -10,
      TrustChangeReason.ADMIN_DELETE_OFFER,
      offerId,
    );
  }

  /**
   * Increase trust score for high views (once per offer)
   */
  async increaseForHighViews(shopId: string, offerId: string): Promise<boolean> {
    // Check if bonus already awarded
    const analytics = await this.prisma.offerAnalytics.findUnique({
      where: { offerId },
      select: { viewBonusAwarded: true, views: true },
    });

    if (!analytics || analytics.viewBonusAwarded || analytics.views < 100) {
      return false;
    }

    // Award bonus
    await this.adjustTrustScore(
      shopId,
      1,
      TrustChangeReason.HIGH_VIEWS_BONUS,
      offerId,
    );

    // Mark bonus as awarded
    await this.prisma.offerAnalytics.update({
      where: { offerId },
      data: { viewBonusAwarded: true },
    });

    return true;
  }

  /**
   * Increase trust score for high saves (once per offer)
   */
  async increaseForHighSaves(shopId: string, offerId: string): Promise<boolean> {
    // Check if bonus already awarded
    const analytics = await this.prisma.offerAnalytics.findUnique({
      where: { offerId },
      select: { saveBonusAwarded: true, saves: true },
    });

    if (!analytics || analytics.saveBonusAwarded || analytics.saves < 20) {
      return false;
    }

    // Award bonus
    await this.adjustTrustScore(
      shopId,
      2,
      TrustChangeReason.HIGH_SAVES_BONUS,
      offerId,
    );

    // Mark bonus as awarded
    await this.prisma.offerAnalytics.update({
      where: { offerId },
      data: { saveBonusAwarded: true },
    });

    return true;
  }

  /**
   * Check if shop can create offers (trust score >= 25)
   */
  async canCreateOffers(shopId: string): Promise<{ allowed: boolean; reason?: string }> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { trustScore: true },
    });

    if (!shop) {
      return { allowed: false, reason: 'Shop not found' };
    }

    if (shop.trustScore < 25) {
      return {
        allowed: false,
        reason: `Trust score too low (${shop.trustScore}/25). Improve your shop's reputation to create offers.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Get trust score for a shop
   */
  async getTrustScore(shopId: string): Promise<number> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { trustScore: true },
    });

    return shop?.trustScore ?? 0;
  }
}
