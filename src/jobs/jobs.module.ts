import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncProcessor } from './sync.processor';
import { SyncScheduler } from './sync.scheduler';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AlertsModule } from '../alerts/alerts.module';
import { Address } from '../entities/address.entity';
import { TokenBalance } from '../entities/token-balance.entity';
import { Transaction } from '../entities/transaction.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'blockchain-sync' }),
    TypeOrmModule.forFeature([Address, TokenBalance, Transaction]),
    BlockchainModule,
    AlertsModule,
  ],
  providers: [SyncProcessor, SyncScheduler],
})
export class JobsModule {}
