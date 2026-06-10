import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  plan: string;

  @Column({ default: 'TRIALING' })
  status: string;

  @Column()
  gateway: string;

  @Column({ nullable: true })
  gatewaySubscriptionId: string;

  @Column({ nullable: true })
  gatewayCustomerId: string;

  @Column({ nullable: true, type: 'datetime' })
  currentPeriodStart: Date;

  @Column({ nullable: true, type: 'datetime' })
  currentPeriodEnd: Date;

  @Column({ nullable: true, type: 'datetime' })
  cancelledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
