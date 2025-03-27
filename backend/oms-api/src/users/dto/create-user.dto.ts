import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含英文字母、数字和下划线'
  })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  password: string;

  @IsNotEmpty({ message: '姓名不能为空' })
  @IsString({ message: '姓名必须是字符串' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: '简介必须是字符串' })
  profile?: string;

  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;

  @IsOptional()
  @IsString({ message: '数据范围必须是字符串' })
  data_scope?: string;

  @IsOptional()
  organization_id?: number;
} 