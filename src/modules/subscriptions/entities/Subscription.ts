import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise';

@Entity('subscriptions')
export class Subscription {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  userId!: string;

  @Column({ name: 'stripe_subscription_id', type: 'varchar', length: 100, nullable: true })
  stripeSubscriptionId!: string | null;

  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 100, nullable: true })
  stripeCustomerId!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: SubscriptionStatus;

  @Column({ name: 'plan_type', type: 'varchar', length: 20, default: 'free' })
  planType!: PlanType;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  isActive(): boolean {
    return this.status === 'active' || this.status === 'trialing';
  }

  isPremium(): boolean {
    return this.planType === 'premium' || this.planType === 'enterprise';
  }
}
