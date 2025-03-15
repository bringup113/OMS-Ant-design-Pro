import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // 从数据库获取完整的用户信息
    const userId = req.user.sub;
    const userDetail = await this.usersService.findOne(userId);
    
    return {
      name: userDetail.name,
      avatar: userDetail.avatar,
      userid: userDetail.id.toString(),
      email: userDetail.email,
      signature: userDetail.profile,
      title: userDetail.roles?.[0]?.name,
      group: userDetail.organization?.name,
      tags: userDetail.roles?.map(role => ({ key: role.id.toString(), label: role.name })) || [],
      access: userDetail.roles?.map(role => role.code).join(',') || '',
    };
  }
  
  @Post('logout')
  async logout() {
    return { status: 'ok' };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('accountSettingCurrentUser')
  async accountSettingCurrentUser(@Request() req) {
    // 从数据库获取完整的用户信息
    const userId = req.user.sub;
    const userDetail = await this.usersService.findOne(userId);
    
    return {
      data: {
        name: userDetail.name,
        avatar: userDetail.avatar,
        userid: userDetail.id.toString(),
        email: userDetail.email,
        signature: userDetail.profile,
        title: userDetail.roles?.[0]?.name,
        group: userDetail.organization?.name,
        tags: userDetail.roles?.map(role => ({ key: role.id.toString(), label: role.name })) || [],
        geographic: {
          province: { label: '', key: '' },
          city: { label: '', key: '' },
        },
      },
    };
  }
} 