import axios from 'axios';
import { AlertsService } from './alerts.service';

jest.mock('axios');

describe('AlertsService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const addressesService = {
    findAll: jest.fn().mockResolvedValue([{ id: 'addr-1' }]),
    findOne: jest.fn().mockResolvedValue({ id: 'addr-1' }),
  };

  afterEach(() => {
    jest.clearAllMocks();
    addressesService.findAll.mockResolvedValue([{ id: 'addr-1' }]);
    addressesService.findOne.mockResolvedValue({ id: 'addr-1' });
  });

  it('should mark alerts as sent after a successful Telegram request', async () => {
    const alertRepository = {
      create: jest.fn((data) => ({ id: 'alert-1', isSent: false, ...data })),
      save: jest
        .fn()
        .mockResolvedValue({ id: 'alert-1', isSent: false, message: 'hello' }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'telegram.botToken') return 'token';
        if (key === 'telegram.chatId') return 'chat';
        return '';
      }),
    };
    mockedAxios.post.mockResolvedValue({} as any);
    const service = new AlertsService(
      alertRepository as any,
      configService as any,
      addressesService as any,
    );

    const result = await service.createAlert('addr-1', 'new_transaction', 'hello');

    expect(alertRepository.update).toHaveBeenCalledWith('alert-1', {
      isSent: true,
    });
    expect(result.isSent).toBe(true);
  });

  it('should leave alerts unsent when Telegram is not configured', async () => {
    const alertRepository = {
      create: jest.fn((data) => ({ id: 'alert-1', isSent: false, ...data })),
      save: jest
        .fn()
        .mockResolvedValue({ id: 'alert-1', isSent: false, message: 'hello' }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const configService = {
      get: jest.fn().mockReturnValue(''),
    };
    const service = new AlertsService(
      alertRepository as any,
      configService as any,
      addressesService as any,
    );

    const result = await service.createAlert('addr-1', 'new_transaction', 'hello');

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(alertRepository.update).not.toHaveBeenCalled();
    expect(result.isSent).toBe(false);
  });

  it('should scope findAll to the current user addresses', async () => {
    const alertRepository = {
      find: jest.fn().mockResolvedValue([]),
    };
    const configService = {
      get: jest.fn(),
    };
    addressesService.findAll.mockResolvedValue([{ id: 'addr-1' }, { id: 'addr-2' }]);
    const service = new AlertsService(
      alertRepository as any,
      configService as any,
      addressesService as any,
    );

    await service.findAll();

    expect(alertRepository.find).toHaveBeenCalledWith({
      where: { addressId: expect.anything() },
      order: { createdAt: 'DESC' },
    });
  });
});
