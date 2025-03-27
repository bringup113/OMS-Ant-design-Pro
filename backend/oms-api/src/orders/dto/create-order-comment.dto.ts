import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderCommentDto {
  @ApiProperty({
    description: '评论内容',
    example: '这是一条评论',
  })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString({ message: '评论内容必须为字符串' })
  content: string;
} 