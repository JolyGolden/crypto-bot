import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Alert } from '../entities/alert.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AddressesService } from '../addresses/addresses.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly configService: ConfigService,
    private readonly addressesService: AddressesService,
  ) {}

  async createAlert(addressId: string, type: string, message: string): Promise<Alert> {
    const alert = this.alertRepository.create({ addressId, type, message });
    const saved = await this.alertRepository.save(alert);
    const isSent = await this.sendTelegram(message);

    if (isSent) {
      await this.alertRepository.update(saved.id, { isSent: true });
      saved.isSent = true;
    }

    return saved;
  }

  async findAll(): Promise<Alert[]> {
    const addresses = await this.addressesService.findAll();
    if (!addresses.length) {
      return [];
    }

    const addressIds = addresses.map((address) => address.id);

    return this.alertRepository.find({
      where: { addressId: In(addressIds) },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAddress(addressId: string): Promise<Alert[]> {
    await this.addressesService.findOne(addressId);
    return this.alertRepository.find({
      where: { addressId },
      order: { createdAt: 'DESC' },
    });
  }

  private async sendTelegram(message: string): Promise<boolean> {
    const botToken = this.configService.get<string>('telegram.botToken');
    const chatId = this.configService.get<string>('telegram.chatId');
    if (!botToken || !chatId) {
      return false;
    }

    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
      });
      return true;
    } catch (err) {
      this.logger.error('Failed to send Telegram message', err);
      return false;
    }
  }
}
