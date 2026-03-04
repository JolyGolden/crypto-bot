import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AlertsService } from '../alerts/alerts.service';
import { Address } from '../entities/address.entity';
import { TokenBalance } from '../entities/token-balance.entity';
import { Transaction } from '../entities/transaction.entity';

@Processor('blockchain-sync')
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly alertsService: AlertsService,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    super();
  }

  async process(job: Job<{ addressId: string }>): Promise<void> {
    const { addressId } = job.data;
    this.logger.log(`Syncing address ${addressId}`);

    const address = await this.addressRepository.findOne({ where: { id: addressId } });
    if (!address) {
      this.logger.warn(`Address ${addressId} not found`);
      return;
    }

    // Sync ERC20 balances
    try {
      const tokens = await this.blockchainService.getERC20Balances(address.address);
      for (const token of tokens) {
        let balance = await this.tokenBalanceRepository.findOne({
          where: { addressId, tokenAddress: token.tokenAddress },
        });
        if (balance) {
          balance.balance = token.balance;
          await this.tokenBalanceRepository.save(balance);
        } else {
          balance = this.tokenBalanceRepository.create({ ...token, addressId });
          await this.tokenBalanceRepository.save(balance);
        }
      }
    } catch (err) {
      this.logger.error('Error syncing token balances', err);
    }

    // Sync transactions
    try {
      const lastTx = await this.transactionRepository.findOne({
        where: { addressId },
        order: { blockNumber: 'DESC' },
      });
      const fromBlock = lastTx ? lastTx.blockNumber + 1 : 0;
      const txs = await this.blockchainService.getTransactions(address.address, fromBlock);

      // Check only the hashes from the current batch to avoid loading all history
      const batchHashes = txs.map((t) => t.hash);
      const existing = batchHashes.length
        ? await this.transactionRepository
            .createQueryBuilder('tx')
            .select('tx.hash')
            .where('tx.addressId = :addressId', { addressId })
            .andWhere('tx.hash IN (:...hashes)', { hashes: batchHashes })
            .getMany()
        : [];
      const existingHashes = new Set(existing.map((t) => t.hash));

      for (const tx of txs) {
        if (existingHashes.has(tx.hash)) continue;

        const direction = tx.toAddress.toLowerCase() === address.address.toLowerCase() ? 'incoming' : 'outgoing';
        const newTx = this.transactionRepository.create({
          ...tx,
          addressId,
          direction,
        });
        await this.transactionRepository.save(newTx);

        await this.alertsService.createAlert(
          addressId,
          'new_transaction',
          `New ${direction} transaction detected for ${address.address}: ${tx.hash}`,
        );
      }
    } catch (err) {
      this.logger.error('Error syncing transactions', err);
    }
  }
}
