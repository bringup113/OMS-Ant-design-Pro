import { IsString, IsOptional, IsNumber, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '机构编码只能包含英文字母和数字，或者为空'
  })
  code?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  parentId?: number;

  @IsNumber()
  @IsOptional()
  sort?: number;

  @IsString()
  @IsOptional()
  status?: string;
} 