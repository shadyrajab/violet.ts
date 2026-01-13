import { singleton, inject } from 'tsyringe';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, PlanType } from '../entities/Subscription';

@singleton()
export class SubscriptionRepository {
  constructor(
    @inject('SubscriptionRepository') private repository: Repository<Subscription>
  ) {}

  async findById(id: string): Promise<Subscription | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return await this.repository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return await this.repository.findOne({
      where: { stripeSubscriptionId }
    });
  }

  async create(
    id: string,
    userId: string,
    planType: PlanType,
    currentPeriodEnd: Date,
    stripeSubscriptionId: string | null = null,
    stripeCustomerId: string | null = null
  ): Promise<Subscription> {
    const status: SubscriptionStatus = planType === 'free' ? 'active' : 'trialing';

    const subscription = new Subscription();
    subscription.id = id;
    subscription.userId = userId;
    subscription.stripeSubscriptionId = stripeSubscriptionId;
    subscription.stripeCustomerId = stripeCustomerId;
    subscription.status = status;
    subscription.planType = planType;
    subscription.currentPeriodEnd = currentPeriodEnd;

    return await this.repository.save(subscription);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription | null> {
    const subscription = await this.findById(id);
    if (!subscription) {
      return null;
    }

    subscription.status = status;
    return await this.repository.save(subscription);
  }

  async updatePlan(id: string, planType: PlanType, currentPeriodEnd: Date): Promise<Subscription | null> {
    const subscription = await this.findById(id);
    if (!subscription) {
      return null;
    }

    subscription.planType = planType;
    subscription.currentPeriodEnd = currentPeriodEnd;
    return await this.repository.save(subscription);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
