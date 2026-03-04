import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '../entities/alert.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly configService: ConfigService,
  ) {}

  async createAlert(addressId: string, type: string, message: string): Promise<Alert> {
    const alert = this.alertRepository.create({ addressId, type, message });
    const saved = await this.alertRepository.save(alert);
    await this.sendTelegram(message);
    return saved;
  }

  async findAll(): Promise<Alert[]> {
    return this.alertRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByAddress(addressId: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { addressId },
      order: { createdAt: 'DESC' },
    });
  }

  private async sendTelegram(message: string): Promise<void> {
    const botToken = this.configService.get<string>('telegram.botToken');
    const chatId = this.configService.get<string>('telegram.chatId');
    if (!botToken || !chatId) return;
    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
      });
    } catch (err) {
      this.logger.error('Failed to send Telegram message', err);
    }
  }
}
