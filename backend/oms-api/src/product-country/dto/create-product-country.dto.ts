import { IsString, IsOptional, Length, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductCountryDto {
  @ApiProperty({ description: '国家名称' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '英文名称' })
  @IsString()
  @Length(1, 100)
  englishName: string;

  @ApiProperty({ description: '状态', enum: ['enabled', 'disabled'], default: 'enabled' })
  @IsOptional()
  @IsString()
  @IsIn(['enabled', 'disabled'])
  status?: string = 'enabled';
} 