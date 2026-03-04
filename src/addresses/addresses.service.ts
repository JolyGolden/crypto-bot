import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create(dto);
    return this.addressRepository.save(address);
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
    await this.addressRepository.remove(address);
  }
}
