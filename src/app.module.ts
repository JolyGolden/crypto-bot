import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { Transaction } from './entities/transaction.entity';
import { TokenBalance } from './entities/token-balance.entity';
import { Alert } from './entities/alert.entity';
import { AddressesModule } from './addresses/addresses.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AlertsModule } from './alerts/alerts.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        entities: [User, Address, Transaction, TokenBalance, Alert],
        synchronize: config.get('database.synchronize'),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    AddressesModule,
    PortfolioModule,
    TransactionsModule,
    AlertsModule,
    BlockchainModule,
    JobsModule,
  ],
})
export class AppModule {}
