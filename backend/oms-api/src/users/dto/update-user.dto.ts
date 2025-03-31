import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // 覆盖email属性，使其在更新时不进行格式验证
  @IsOptional()
  @IsString({ message: '邮箱必须是字符串' })  // 只验证是字符串，不验证邮箱格式
  email?: string;
} 