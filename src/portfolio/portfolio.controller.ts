import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':addressId')
  @ApiOperation({ summary: 'Get portfolio for an address' })
  getPortfolio(@Param('addressId') addressId: string) {
    return this.portfolioService.getPortfolio(addressId);
  }
}
