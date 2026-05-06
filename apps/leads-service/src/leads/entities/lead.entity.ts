import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@autonova/database';

@Entity('leads')
export class Lead extends BaseEntity {
  @Column({ nullable: true })
  vehicleId: string;

  @Column({ nullable: true })
  customerId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  type: string;

  @Column({ default: 'NEW' })
  @Index()
  status: string;

  @Column({ nullable: true, type: 'nvarchar', length: 'max' })
  message: string;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true, type: 'nvarchar', length: 'max' })
  notes: string;
}
