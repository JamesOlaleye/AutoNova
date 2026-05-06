import { BaseEntity } from '@autonova/database';
import {
  Column,
  Entity,
  Index,
} from 'typeorm';

@Entity('vehicles')
@Index(['tenantId'])
@Index(['status'])
export class Vehicle extends BaseEntity {
  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('decimal', { precision: 18, scale: 2 })
  price: number;

  @Column({ length: 3 })
  currency: string;

  @Column()
  mileage: number;

  @Column({ default: 'KM' })
  mileageUnit: string;

  @Column()
  condition: string;

  @Column()
  transmission: string;

  @Column()
  fuelType: string;

  @Column({ default: 'RHD' })
  driveType: string;

  @Column()
  color: string;

  @Column({ nullable: true, unique: true })
  vin: string;

  @Column({ nullable: true })
  engineSize: string;

  @Column({ default: 'AVAILABLE' })
  @Index()
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  features: string[];

  @Column({ type: 'simple-json', nullable: true })
  images: string[];
}
