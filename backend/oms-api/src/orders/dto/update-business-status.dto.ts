import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBusinessStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;
} 