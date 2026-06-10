import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@autonova/database';

@Entity('orders')
export class Order extends BaseEntity {
  @Column()
  vehicleId: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  leadId: string;

  @Column({ nullable: true })
  salesAgentId: string;

  @Column()
  type: string;

  @Column({ default: 'PENDING' })
  @Index()
  status: string;

  @Column('decimal', { precision: 18, scale: 2 })
  salePrice: number;

  @Column({ length: 3 })
  currency: string;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  downPayment: number;

  @Column({ nullable: true })
  financingTerm: number;

  @Column({ nullable: true, type: 'nvarchar', length: 'max' })
  notes: string;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  documents: { url: string; publicId: string; name: string; docType: string; uploadedAt: string }[];
}
