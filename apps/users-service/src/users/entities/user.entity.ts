import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@autonova/database';

@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class User extends BaseEntity {
  @Column()
  @Index()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'CUSTOMER' })
  role: string;

  @Column({ default: true })
  isActive: boolean;
}
