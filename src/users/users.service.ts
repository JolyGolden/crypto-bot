import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getOrCreateCurrentUserId(): Promise<string> {
    const userId = this.configService.get<string>('app.defaultUserId');
    if (!userId) {
      throw new Error('APP_DEFAULT_USER_ID is not configured');
    }

    const exists = await this.userRepository.exists({
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
