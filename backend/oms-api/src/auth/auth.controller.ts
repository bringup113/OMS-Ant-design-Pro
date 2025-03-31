import { Controller, Post, Body, UseGuards, Get, UnauthorizedException, InternalServerErrorException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

// 扩展Express的Request类型，添加user属性
declare module 'express' {
  interface Request {
    user: any;
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      console.log('登录请求:', loginDto);
      return await this.authService.login(loginDto);
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    try {
      console.log('获取用户资料, 用户信息:', req.user);
      
      // 从数据库获取完整的用户信息
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        console.error('未找到用户ID:', req.user);
        throw new UnauthorizedException('未授权访问');
      }

      const user = await this.usersService.findOne(userId);
      if (!user) {
        console.error(`用户不存在, ID: ${userId}`);
        throw new UnauthorizedException('用户不存在');
      }

      // 添加角色和权限信息
      const userDetail = await this.authService.getUserDetail(userId);
      const permissions = userDetail ? this.authService.getUserPermissions(userDetail) : [];
      
      console.log(`用户 ${user.username} 的数据范围: ${user.data_scope || '未设置'}`);
      console.log('成功获取用户资料');
      
      // 返回用户信息，确保permissions存在
      return {
        ...user,
        data_scope: user.data_scope, // 确保返回用户的数据范围
        organizationId: user.organization?.id || null, // 添加organizationId字段
        permissions: req.user?.permissions || permissions || [],
        currentAuthority: 'admin', // 设定当前用户权限，根据实际角色动态返回
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new InternalServerErrorException('获取用户信息失败');
    }
  }

  @Post('logout')
  async logout() {
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('accountSettingCurrentUser')
  async accountSettingCurrentUser(@Req() req: Request) {
    try {
      console.log('获取账户设置用户信息:', req.user);
      
      // 从数据库获取完整的用户信息
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        console.error('未找到用户ID:', req.user);
        throw new UnauthorizedException('未授权访问');
      }
      
      const userDetail = await this.usersService.findOne(userId);
      if (!userDetail) {
        console.error(`用户不存在, ID: ${userId}`);
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
    } catch (error) {
      console.error('获取账户设置用户信息失败:', error);
      throw new InternalServerErrorException('获取账户设置用户信息失败');
    }
  }

  @Get('currentuser')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: Request) {
    try {
      console.log('获取当前用户信息:', req.user);
      
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        console.error('未找到用户ID:', req.user);
        throw new UnauthorizedException('用户未认证');
      }
      
      const fullUser = await this.authService.getUserDetail(userId);
      
      if (!fullUser) {
        console.error(`用户不存在, ID: ${userId}`);
        throw new UnauthorizedException('用户不存在或已被删除');
      }
      
      // 获取用户权限值
      const permissionValue = await this.authService.calculateUserPermissions(fullUser);
      
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

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    try {
      console.log('刷新令牌请求:', {
        user: req.user,
        headers: req.headers,
      });
      
      if (!req.user) {
        console.error('刷新令牌失败: 无效的用户信息');
        throw new UnauthorizedException('无效的用户信息');
      }
      
      const result = await this.authService.refreshToken(req.user);
      console.log('刷新令牌成功:', result);
      return result;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : '刷新令牌失败'
      );
    }
  }
} 