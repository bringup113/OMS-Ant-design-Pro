import { IsString, IsOptional, IsNumber, IsArray, Matches } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: '角色编码只能包含英文字母和数字'
  })
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  sort?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  dataScope?: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsArray()
  @IsOptional()
  organizations?: string[];
} 