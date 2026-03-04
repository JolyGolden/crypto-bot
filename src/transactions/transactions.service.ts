import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findByAddress(addressId: string, query: TransactionQueryDto) {
    const { page = 1, limit = 20 } = query;
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { addressId },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
