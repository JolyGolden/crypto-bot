import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBalance } from '../entities/token-balance.entity';
import { AddressesService } from '../addresses/addresses.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
    private readonly addressesService: AddressesService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async getPortfolio(addressId: string) {
    const addr = await this.addressesService.findOne(addressId);
    const nativeBalance = await this.blockchainService.getNativeBalance(addr.address);
    const tokenBalances = await this.tokenBalanceRepository.find({
      where: { addressId },
    });
    return {
      address: addr.address,
      chain: addr.chain,
      nativeBalance,
      tokenBalances,
    };
  }
}
