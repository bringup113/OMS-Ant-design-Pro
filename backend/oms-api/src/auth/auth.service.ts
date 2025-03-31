import { Injectable, UnauthorizedException, Inject, InternalServerErrorException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      console.log('开始验证用户:', username);
      const user = await this.usersService.findByUsername(username);
      
      if (!user) {
        console.log('用户不存在:', username);
        return null;
      }

      console.log('找到用户，开始验证密码');
      console.log('用户密码哈希:', user.password);
      console.log('输入的密码:', password);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('密码验证结果:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('密码验证失败');
        return null;
      }

      // 检查用户状态
      console.log('用户状态:', user.status);
      if (user.status !== '1') {
        console.log('用户已被禁用:', username);
        throw new UnauthorizedException('用户已被禁用');
      }

      // 返回完整的用户信息（除了密码）
      const { password: _, ...result } = user;
      console.log('用户验证成功，返回数据:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('验证用户时发生错误:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 获取用户所属机构的角色
    const roles = user.organization?.roles || [];
    console.log('用户所属机构的角色:', roles);

    // 预计算用户权限
    const permissionValue = await this.calculateUserPermissions(user);
    const permissionCodes = this.getUserPermissions(user);

    const payload = {
      sub: user.id,
      username: user.username,
      organization_id: user.organization?.id,
      permission_value: permissionValue,
      data_scope: user.data_scope,
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
      })),
      permissions: permissionCodes,
    };

    // 将权限列表缓存到Redis
    await this.cacheManager.set(
      `user_permissions_${user.id}`,
      { permissionValue, permissionCodes },
      1800 // 30分钟
    );

    // 返回前端期望的格式
    return {
      status: 'ok',
      type: 'account',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userid: user.id.toString(),
        username: user.username,
        name: user.name,
        nickname: user.name,
        avatar: user.avatar,
        email: user.email,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
          code: user.organization.code,
        } : null,
        organizationId: user.organization?.id || null, // 添加organizationId字段
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          code: role.code,
        })),
        data_scope: user.data_scope,
        title: roles[0]?.name,
        group: user.organization?.name,
        permissionValue: permissionValue, // 添加权限值
        permissions: permissionCodes, // 添加权限代码列表
      },
    };
  }

  // 修改：计算用户权限值 (permission_value) 使用缓存
  async calculateUserPermissions(user: User): Promise<number> {
    // 尝试从缓存获取权限值
    const cacheKey = `user_permission_value_${user.id}`;
    const cachedValue = await this.cacheManager.get<number>(cacheKey);
    
    if (cachedValue !== undefined && cachedValue !== null) {
      return cachedValue;
    }
    
    // 缓存未命中，计算权限值
    // 检查用户是否具有管理员角色
    const isAdmin = user.roles?.some(role => role.code === 'SUPER_ADMIN' || role.code === 'ADMIN');
    
    // 如果用户是管理员，给予所有权限
    if (isAdmin) {
      const allPermissions = 0xFFFFFFFF;
      // 存入缓存
      await this.cacheManager.set(cacheKey, allPermissions, 1800);
      return allPermissions;
    }
    
    // 加载用户的完整数据（包括组织和角色）
    const fullUser = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['organization', 'organization.roles', 'organization.roles.permissions'],
    });
    
    if (!fullUser || !fullUser.organization) {
      await this.cacheManager.set(cacheKey, 0, 1800);
      return 0;
    }
    
    // 合并所有角色的权限
    let finalPermission = 0;
    
    if (fullUser.organization.roles) {
      for (const role of fullUser.organization.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            // 使用位运算"或"(OR)合并权限
            finalPermission |= permission.permission_value || 0;
          }
        }
      }
    }
    
    // 存入缓存
    await this.cacheManager.set(cacheKey, finalPermission, 1800);
    return finalPermission;
  }

  // 清除用户权限缓存
  async clearUserPermissionsCache(userId: number): Promise<void> {
    await this.cacheManager.del(`user_permission_value_${userId}`);
    await this.cacheManager.del(`user_permissions_${userId}`);
  }

  /**
   * 获取用户详细信息
   * @param userId 用户ID
   * @returns 用户详细信息，包括组织和角色
   */
  async getUserDetail(userId: number): Promise<User | null> {
    try {
      console.log(`获取用户详情, ID: ${userId}`);
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['organization', 'organization.roles', 'organization.roles.permissions'],
      });
      
      if (user) {
        console.log(`用户 ${user.username} 的数据范围: ${user.data_scope || '未设置'}`);
      }
      
      return user;
    } catch (error) {
      console.error(`获取用户详情失败, ID: ${userId}`, error);
      return null;
    }
  }

  /**
   * 获取用户权限代码列表
   * @param user 用户对象（需要包含组织和角色信息）
   * @returns 权限代码数组
   */
  public getUserPermissions(user: any): string[] {
    const permissions = new Set<string>();
    
    // 检查是否是管理员
    const isAdmin = user.roles?.some(role => 
      role.code === 'SUPER_ADMIN' || role.code === 'ADMIN'
    );

    // 如果是管理员，添加所有系统管理权限
    if (isAdmin) {
      const systemPermissions = [
        'system',
        'system.user-list',
        'system.organization',
        'system.role',
        'system.category',
        'system.country'
      ];
      systemPermissions.forEach(perm => permissions.add(perm));
    }
    
    // 其他模块的权限处理
    if (user.organization?.roles) {
      for (const role of user.organization.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            // 如果不是管理员，排除系统管理权限
            if (isAdmin || !permission.code.startsWith('system')) {
              permissions.add(permission.code);
            }
          }
        }
      }
    }
    
    return Array.from(permissions);
  }

  /**
   * 获取所有权限列表（仅管理员可访问）
   */
  async getAllPermissions(user: any): Promise<any[]> {
    // 检查是否是管理员
    const isAdmin = user.roles?.some(role => 
      role.code === 'SUPER_ADMIN' || role.code === 'ADMIN'
    );

    if (!isAdmin) {
      throw new UnauthorizedException('没有权限访问此功能');
    }

    // 获取所有权限
    const permissions = await this.permissionsRepository.find({
      order: {
        type: 'ASC',
        sort: 'ASC',
        id: 'ASC'
      }
    });

    return permissions;
  }

  /**
   * 刷新用户访问令牌
   * @param user 用户对象
   * @returns 新的访问令牌
   */
  async refreshToken(user: any) {
    try {
      console.log('开始刷新令牌，用户信息:', user);
      
      // 获取完整的用户信息
      const userId = user.sub || user.id;
      if (!userId) {
        throw new UnauthorizedException('无效的用户信息');
      }
      
      // 查询用户时包含组织及其角色和权限
      const fullUser = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['organization', 'organization.roles', 'organization.roles.permissions'],
      });
      
      if (!fullUser) {
        throw new UnauthorizedException('用户不存在');
      }

      // 直接使用数据库中的data_scope值，而不是根据角色判断
      // 如果数据库中的data_scope为空，则使用合理的默认值
      const data_scope = fullUser.data_scope || 'organization';
      
      console.log(`用户 ${fullUser.username} 的数据范围: ${data_scope}`);

      // 获取用户的权限代码列表
      const permissions = this.getUserPermissions(fullUser);
      console.log(`用户 ${fullUser.username} 权限数量: ${permissions.length}`);

      // 创建新的令牌载荷
      const payload = {
        sub: fullUser.id,
        username: fullUser.username,
        organizationId: fullUser.organization?.id,
        data_scope: data_scope,  // 添加数据范围信息
        permissions: permissions,
      };

      // 生成新令牌
      const access_token = this.jwtService.sign(payload);
      console.log('生成新令牌成功');

      return {
        status: 'ok',
        type: 'account',
        access_token,
        user: {
          id: fullUser.id,
          userid: fullUser.id.toString(),
          username: fullUser.username,
          name: fullUser.name,
          email: fullUser.email,
          data_scope: data_scope,  // 添加数据范围信息
          organization: fullUser.organization ? {
            id: fullUser.organization.id,
            name: fullUser.organization.name,
            code: fullUser.organization.code,
          } : null,
          organizationId: fullUser.organization?.id || null, // 添加organizationId字段
          permissions: permissions,
        },
      };
    } catch (error) {
      console.error('刷新令牌失败:', error);
      throw new InternalServerErrorException('刷新令牌失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
} 