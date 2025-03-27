import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
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
    try {
      console.log('收到登录请求:', {
        username: loginDto.username,
        autoLogin: loginDto.autoLogin
      });
      
      const result = await this.authService.login(loginDto);
      console.log('登录成功:', {
        username: loginDto.username,
        userId: result.user.id
      });
      
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // 从数据库获取完整的用户信息
    const userId = req.user.id;
    console.log('JWT解码后的用户信息:', req.user);
    console.log('获取用户信息，用户ID:', userId, typeof userId);
    
    // 确保 userId 是数字类型
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      throw new UnauthorizedException('无效的用户ID');
    }
    
    const userDetail = await this.usersService.findOne(userIdNumber);
    if (!userDetail) {
      throw new UnauthorizedException('用户不存在');
    }

    console.log('获取到的用户信息:', userDetail);
    
    // 获取用户所属机构的角色
    const roles = userDetail.organization?.roles || [];
    
    return {
      id: userDetail.id,
      userid: userDetail.id.toString(),
      username: userDetail.username,
      name: userDetail.name,
      nickname: userDetail.name,
      avatar: userDetail.avatar,
      email: userDetail.email,
      signature: userDetail.profile,
      organization: userDetail.organization ? {
        id: userDetail.organization.id,
        name: userDetail.organization.name,
        code: userDetail.organization.code,
      } : null,
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
      })),
      data_scope: userDetail.data_scope,
      title: roles[0]?.name,
      group: userDetail.organization?.name,
      tags: roles.map(role => ({ key: role.id.toString(), label: role.name })),
      permissions: req.user.permissions || []
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
    const userId = req.user.id;
    console.log('JWT解码后的用户信息:', req.user);
    console.log('获取用户信息，用户ID:', userId, typeof userId);
    
    const userDetail = await this.usersService.findOne(userId);
    if (!userDetail) {
      throw new UnauthorizedException('用户不存在');
    }
    
    return {
      data: {
        name: userDetail.name,
        avatar: userDetail.avatar,
        userid: userDetail.id.toString(),
        email: userDetail.email,
        signature: userDetail.profile,
        title: userDetail.organization?.roles?.[0]?.name,
        group: userDetail.organization?.name,
        tags: userDetail.organization?.roles?.map(role => ({ 
          key: role.id.toString(), 
          label: role.name 
        })) || []
      },
    };
  }
} 