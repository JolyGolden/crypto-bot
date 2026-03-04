import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hash: string;

  @Column()
  fromAddress: string;

  @Column()
  toAddress: string;

  @Column()
  value: string;

  @Column({ nullable: true })
  tokenAddress: string;

  @Column({ nullable: true })
  tokenSymbol: string;

  @Column()
  blockNumber: number;

  @Column()
  timestamp: Date;

  @Column({ type: 'varchar' })
  direction: 'incoming' | 'outgoing';

  @Column()
  addressId: string;

  @ManyToOne(() => Address, (addr) => addr.transactions)
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @CreateDateColumn()
  createdAt: Date;
}
