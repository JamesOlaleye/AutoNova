import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column()
  name: string;

  @Column({ length: 2 })
  country: string;

  @Column({ length: 3 })
  currency: string;

  @Column()
  locale: string;

  @Column({ default: 'STARTER' })
  plan: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  customDomain: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  paystackCustomerId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
