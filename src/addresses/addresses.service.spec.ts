import { ConflictException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from '../entities/address.entity';
import { Alert } from '../entities/alert.entity';
import { TokenBalance } from '../entities/token-balance.entity';
import { Transaction } from '../entities/transaction.entity';

describe('AddressesService', () => {
  const usersService = {
    getOrCreateCurrentUserId: jest
      .fn()
      .mockResolvedValue('00000000-0000-0000-0000-000000000001'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.getOrCreateCurrentUserId.mockResolvedValue(
      '00000000-0000-0000-0000-000000000001',
    );
  });

  it('should translate unique constraint violations into ConflictException', async () => {
    const addressRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn().mockRejectedValue({ code: '23505' }),
    };
    const dataSource = {
      transaction: jest.fn(),
    };
    const service = new AddressesService(
      addressRepository as any,
      dataSource as any,
      usersService as any,
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
    const dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(async (callback: (txManager: DeleteManager) => void) =>
          callback(manager),
        ),
    };
    const service = new AddressesService(
      addressRepository as any,
      dataSource as any,
      usersService as any,
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

  it('should persist scoped addresses for the current user', async () => {
    const addressRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn().mockImplementation(async (entity) => entity),
    };
    const dataSource = {
      transaction: jest.fn(),
    };
    const service = new AddressesService(
      addressRepository as any,
      dataSource as any,
      usersService as any,
    );

    const result = await service.create({
      address: '0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD',
    });

    expect(usersService.getOrCreateCurrentUserId).toHaveBeenCalled();
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
