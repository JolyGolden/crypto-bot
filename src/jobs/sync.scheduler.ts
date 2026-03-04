import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';

@Injectable()
export class SyncScheduler {
  private readonly logger = new Logger(SyncScheduler.name);

  constructor(
    @InjectQueue('blockchain-sync')
    private readonly syncQueue: Queue,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduleSyncJobs(): Promise<void> {
    const addresses = await this.addressRepository.find({ where: { isActive: true } });
    this.logger.log(`Scheduling sync for ${addresses.length} addresses`);
    for (const address of addresses) {
      await this.syncQueue.add('sync-address', { addressId: address.id });
    }
  }
}
