import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { Alert } from '../entities/alert.entity';
import { TokenBalance } from '../entities/token-balance.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    const userId = await this.getOrCreateCurrentUserId();
    const address = this.addressRepository.create({
      ...dto,
      address: dto.address.toLowerCase(),
      userId,
    });
    try {
      return await this.addressRepository.save(address);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(`Address ${dto.address} is already tracked`);
      }
      throw error;
    }
  }

  async findAll(): Promise<Address[]> {
    const userId = await this.getOrCreateCurrentUserId();
    return this.addressRepository.find({
      where: { userId },
    });
  }

  async findOne(id: string): Promise<Address> {
    const userId = await this.getOrCreateCurrentUserId();
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException(`Address ${id} not found`);
    return address;
  }

  async remove(id: string): Promise<void> {
    const address = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Alert, { addressId: address.id });
      await manager.delete(Transaction, { addressId: address.id });
      await manager.delete(TokenBalance, { addressId: address.id });
      await manager.delete(Address, { id: address.id });
    });
  }

  private async getOrCreateCurrentUserId(): Promise<string> {
    const userId = this.configService.get<string>('app.defaultUserId');
    if (!userId) {
      throw new Error('APP_DEFAULT_USER_ID is not configured');
    }

    const exists = await this.userRepository.exist({
      where: { id: userId },
    });
    if (!exists) {
      try {
        await this.userRepository.save(
          this.userRepository.create({
            id: userId,
            status: 'active',
          }),
        );
      } catch (error) {
        if (!this.isUniqueViolation(error)) {
          throw error;
        }
      }
    }

    return userId;
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const queryError = error as {
      code?: string;
      driverError?: { code?: string };
    };

    return (
      queryError.code === '23505' || queryError.driverError?.code === '23505'
    );
  }
}
