import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':addressId')
  @ApiOperation({ summary: 'Get transactions for an address' })
  getTransactions(
    @Param('addressId') addressId: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.findByAddress(addressId, query);
  }
}
