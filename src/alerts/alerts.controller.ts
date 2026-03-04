import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  findAll() {
    return this.alertsService.findAll();
  }

  @Get(':addressId')
  @ApiOperation({ summary: 'Get alerts for an address' })
  findByAddress(@Param('addressId') addressId: string) {
    return this.alertsService.findByAddress(addressId);
  }
}
