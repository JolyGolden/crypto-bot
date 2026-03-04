import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { Alert } from '../entities/alert.entity';
import { TokenBalance } from '../entities/token-balance.entity';
import { Transaction } from '../entities/transaction.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create(dto);
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
    return this.addressRepository.find();
  }

  async findOne(id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id } });
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
