import { ConflictException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from '../entities/address.entity';
import { Alert } from '../entities/alert.entity';
import { TokenBalance } from '../entities/token-balance.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

describe('AddressesService', () => {
  const configService = {
    get: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should translate unique constraint violations into ConflictException', async () => {
    const addressRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn().mockRejectedValue({ code: '23505' }),
    };
    const userRepository = {
      exist: jest.fn().mockResolvedValue(true),
      save: jest.fn(),
      create: jest.fn((dto) => dto),
    };
    const dataSource = {
      transaction: jest.fn(),
    };
    const service = new AddressesService(
      addressRepository as any,
      userRepository as any,
      dataSource as any,
      configService as any,
    );

    await expect(
      service.create({ address: '0x1234567890123456789012345678901234567890' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should delete child records before removing the address', async () => {
    type DeleteManager = {
      delete: jest.Mock<Promise<void>, [unknown, Record<string, string>]>;
    };

    const manager: DeleteManager = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const addressRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'addr-1' } as Address),
    };
    const userRepository = {
      exist: jest.fn().mockResolvedValue(true),
      save: jest.fn(),
      create: jest.fn((dto) => dto),
    };
    const dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(async (callback: (txManager: DeleteManager) => void) =>
          callback(manager),
        ),
    };
    const service = new AddressesService(
      addressRepository as any,
      userRepository as any,
      dataSource as any,
      configService as any,
    );

    await service.remove('addr-1');

    expect(manager.delete).toHaveBeenNthCalledWith(1, Alert, {
      addressId: 'addr-1',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(2, Transaction, {
      addressId: 'addr-1',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(3, TokenBalance, {
      addressId: 'addr-1',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(4, Address, { id: 'addr-1' });
    expect(addressRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'addr-1',
        userId: '00000000-0000-0000-0000-000000000001',
      },
    });
  });

  it('should create the default user and persist scoped addresses', async () => {
    const addressRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn().mockImplementation(async (entity) => entity),
    };
    const userRepository = {
      exist: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' } as User),
      create: jest.fn((dto) => dto),
    };
    const dataSource = {
      transaction: jest.fn(),
    };
    const service = new AddressesService(
      addressRepository as any,
      userRepository as any,
      dataSource as any,
      configService as any,
    );

    const result = await service.create({
      address: '0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD',
    });

    expect(userRepository.save).toHaveBeenCalledWith({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'active',
    });
    expect(addressRepository.create).toHaveBeenCalledWith({
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      userId: '00000000-0000-0000-0000-000000000001',
    });
    expect(result).toEqual({
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      userId: '00000000-0000-0000-0000-000000000001',
    });
  });
});
