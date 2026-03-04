import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { TokenBalance } from './token-balance.entity';
import { Alert } from './alert.entity';

@Unique(['userId', 'chain', 'address'])
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column({ default: 'polygon' })
  chain: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

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
