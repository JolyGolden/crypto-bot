import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';

@Entity('token_balances')
export class TokenBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tokenAddress: string;

  @Column()
  tokenSymbol: string;

  @Column()
  tokenName: string;

  @Column()
  balance: string;

  @Column()
  decimals: number;

  @Column()
  addressId: string;

  @ManyToOne(() => Address, (addr) => addr.tokenBalances)
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @UpdateDateColumn()
  updatedAt: Date;
}
