import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { TokenBalance } from './token-balance.entity';
import { Alert } from './alert.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  address: string;

  @Column({ default: 'polygon' })
  chain: string;

  @Column({ nullable: true })
  label: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (tx) => tx.address)
  transactions: Transaction[];

  @OneToMany(() => TokenBalance, (tb) => tb.address)
  tokenBalances: TokenBalance[];

  @OneToMany(() => Alert, (alert) => alert.address)
  alerts: Alert[];
}
