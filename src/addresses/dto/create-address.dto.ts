import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'EVM wallet address (0x-prefixed, 42 characters)' })
  @IsString()
  @Matches(/^0x[0-9a-fA-F]{40}$/, { message: 'address must be a valid EVM address' })
  address: string;

  @ApiPropertyOptional({ description: 'Blockchain chain', default: 'polygon' })
  @IsOptional()
  @IsString()
  chain?: string;

  @ApiPropertyOptional({ description: 'Optional label' })
  @IsOptional()
  @IsString()
  label?: string;
}
