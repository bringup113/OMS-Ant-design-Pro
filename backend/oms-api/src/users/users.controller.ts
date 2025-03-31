import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('current') current?: string,
    @Query('pageSize') pageSize?: string,
    @Query('username') username?: string,
    @Query('name') name?: string,
    @Query('organization') organization?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const queryParams = {
      current: current ? parseInt(current, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      username,
      name,
      organization,
      role,
      status,
    };
    return this.usersService.findAll(queryParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Patch(':id/data-scope')
  async updateDataScope(@Param('id') id: string, @Body() body: { data_scope: string }) {
    console.log('收到更新用户数据范围请求, 用户ID:', id);
    console.log('数据范围:', body.data_scope);
    
    try {
      const result = await this.usersService.updateDataScope(+id, body.data_scope);
      console.log('更新用户数据范围成功');
      return result;
    } catch (error) {
      console.error('更新用户数据范围失败:', error);
      throw error;
    }
  }
} 