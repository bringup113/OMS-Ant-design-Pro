import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
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

  @Get('currentuser')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const user = req.user;
    
    if (!user) {
      throw new UnauthorizedException('用户未认证');
    }
    
    try {
      const fullUser = await this.authService.getUserDetail(user.id);
      
      if (!fullUser) {
        throw new UnauthorizedException('用户不存在或已被删除');
      }
      
      // 获取用户权限值
      const permissionValue = await this.authService.calculateUserPermissions(user);
      
      return {
        userid: fullUser.id,
        name: fullUser.name,
        avatar: fullUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        email: fullUser.email,
        signature: fullUser.profile || '暂无个人简介',
        title: '系统用户', // 固定职位名称，因为User没有title属性
        group: fullUser.organization?.name || '暂无所属部门',
        tags: [
          {
            key: '0',
            label: '很有想法的',
          },
        ],
        unreadCount: 0,
        roles: fullUser.roles,
        permissions: this.authService.getUserPermissions(fullUser),
        permissionValue: permissionValue,
      };
    } catch (error) {
      console.error('获取用户详情失败:', error);
      throw new InternalServerErrorException('获取用户详情失败');
    }
  }
} 