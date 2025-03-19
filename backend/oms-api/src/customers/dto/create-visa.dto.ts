import { IsString, IsOptional, IsNumber, Length, IsNotEmpty, Matches } from 'class-validator';

export class CreateVisaDto {
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsString()
  @Length(1, 50)
  country: string;

  @IsString()
  @Length(1, 100)
  visaName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '签证签发日期格式应为YYYY-MM-DD' })
  issueDate: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '签证到期日期格式应为YYYY-MM-DD' })
  expiryDate: string | null;
} 