import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  addressId: string;

  @ManyToOne(() => Address, (addr) => addr.alerts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @Column()
  type: string;

  @Column()
  message: string;

  @Column({ default: false })
  isSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
