import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new address to track' })
  create(@Body() dto: CreateAddressDto) {
    return this.addressesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tracked addresses' })
  findAll() {
    return this.addressesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address by ID' })
  findOne(@Param('id') id: string) {
    return this.addressesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a tracked address' })
  remove(@Param('id') id: string) {
    return this.addressesService.remove(id);
  }
}
