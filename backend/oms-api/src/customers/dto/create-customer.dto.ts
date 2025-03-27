import { IsString, IsOptional, Length, IsIn, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 50)
  passportNo: string;

  @IsString()
  @IsIn(['male', 'female'])
  gender: string;

  @IsString()
  @Length(1, 50)
  country: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '出生日期格式应为YYYY-MM-DD' })
  birthDate: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '护照签发日期格式应为YYYY-MM-DD' })
  issueDate: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '护照到期日期格式应为YYYY-MM-DD' })
  expiryDate: string | null;
} 