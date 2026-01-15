import { singleton, inject } from 'tsyringe';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { UserServerSubscriptionRepository } from '../repositories/UserServerSubscriptionRepository';
import { Subscription } from '../entities/Subscription';
import { UserServerSubscription } from '../entities/UserServerSubscription';
import { Logger } from '../../../core/logger';
import { v4 as uuidv4 } from 'uuid';

@singleton()
export class SubscriptionService {
  constructor(
    @inject(SubscriptionRepository) private subscriptionRepository: SubscriptionRepository,
    @inject(UserServerSubscriptionRepository) private userServerRepository: UserServerSubscriptionRepository,
    @inject(Logger) private logger: Logger
  ) {}

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      return await this.subscriptionRepository.findByUserId(userId);
    } catch (error) {
      this.logger.error('Failed to get user subscription', error as Error, { userId });
      throw error;
    }
  }

  async createFreeSubscription(userId: string): Promise<Subscription> {
    try {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      const subscription = await this.subscriptionRepository.create(
        uuidv4(),
        userId,
        'free',
        oneYearFromNow
      );

      this.logger.info('Free subscription created', { userId, subscriptionId: subscription.id });
      return subscription;
    } catch (error) {
      this.logger.error('Failed to create free subscription', error as Error, { userId });
      throw error;
    }
  }

  async linkServerToSubscription(userId: string, serverId: string, subscriptionId: string): Promise<UserServerSubscription> {
    try {
      const existing = await this.userServerRepository.findByUserAndServer(userId, serverId);

      if (existing) {
        this.logger.warn('Server already linked to subscription', { userId, serverId, existing: existing.id });
        return existing;
      }

      const link = await this.userServerRepository.create(uuidv4(), userId, serverId, subscriptionId);

      this.logger.info('Server linked to subscription', { userId, serverId, subscriptionId });
      return link;
    } catch (error) {
      this.logger.error('Failed to link server to subscription', error as Error, { userId, serverId, subscriptionId });
      throw error;
    }
  }

  async unlinkServerFromSubscription(userId: string, serverId: string): Promise<void> {
    try {
      const link = await this.userServerRepository.findByUserAndServer(userId, serverId);

      if (!link) {
        this.logger.warn('No subscription link found for server', { userId, serverId });
        return;
      }

      await this.userServerRepository.deactivate(link.id);

      this.logger.info('Server unlinked from subscription', { userId, serverId });
    } catch (error) {
      this.logger.error('Failed to unlink server from subscription', error as Error, { userId, serverId });
      throw error;
    }
  }

  async getUserServers(userId: string): Promise<UserServerSubscription[]> {
    try {
      return await this.userServerRepository.findByUser(userId);
    } catch (error) {
      this.logger.error('Failed to get user servers', error as Error, { userId });
      throw error;
    }
  }

  async isServerActive(serverId: string): Promise<boolean> {
    try {
      const links = await this.userServerRepository.findByServer(serverId);
      return links.length > 0;
    } catch (error) {
      this.logger.error('Failed to check server active status', error as Error, { serverId });
      return false;
    }
  }

  async getServerSubscription(serverId: string): Promise<Subscription | null> {
    try {
      const links = await this.userServerRepository.findByServer(serverId);
      if (links.length === 0) {
        return null;
      }

      const subscription = await this.subscriptionRepository.findById(links[0].subscriptionId);
      return subscription;
    } catch (error) {
      this.logger.error('Failed to get server subscription', error as Error, { serverId });
      return null;
    }
  }

  async isServerPremium(serverId: string): Promise<boolean> {
    try {
      const subscription = await this.getServerSubscription(serverId);
      return subscription !== null && subscription.isActive() && subscription.isPremium();
    } catch (error) {
      this.logger.error('Failed to check server premium status', error as Error, { serverId });
      return false;
    }
  }

  async upgradeToPremium(subscriptionId: string, expiresAt: Date): Promise<Subscription | null> {
    try {
      const subscription = await this.subscriptionRepository.updatePlan(subscriptionId, 'premium', expiresAt);
      if (subscription) {
        this.logger.info('Subscription upgraded to premium', { subscriptionId });
      }
      return subscription;
    } catch (error) {
      this.logger.error('Failed to upgrade subscription to premium', error as Error, { subscriptionId });
      throw error;
    }
  }
}
