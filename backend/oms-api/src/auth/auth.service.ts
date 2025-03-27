import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    const payload = {
      sub: user.id,
      username: user.username,
      organization_id: user.organization?.id,
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
      })),
      permissions: this.getUserPermissions(user),
    };

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
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          code: role.code,
        })),
        data_scope: user.data_scope,
        title: roles[0]?.name,
        group: user.organization?.name,
      },
    };
  }

  // 新增：计算用户权限值 (permission_value)
  async calculateUserPermissions(user: User): Promise<number> {
    // 检查用户是否具有管理员角色
    const isAdmin = user.roles?.some(role => role.code === 'SUPER_ADMIN' || role.code === 'ADMIN');
    
    // 如果用户是管理员，给予所有权限
    if (isAdmin) {
      return 0xFFFFFFFF; // 所有位都为1，表示拥有所有权限
    }
    
    // 加载用户的完整数据（包括组织和角色）
    const fullUser = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['organization', 'organization.roles', 'organization.roles.permissions'],
    });
    
    if (!fullUser || !fullUser.organization) {
      return 0; // 没有权限
    }
    
    // 合并用户所属组织的所有角色的权限
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
    
    return finalPermission;
  }

  /**
   * 获取用户详细信息
   * @param userId 用户ID
   * @returns 用户详细信息，包括组织和角色
   */
  async getUserDetail(userId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organization', 'organization.roles', 'organization.roles.permissions', 'roles'],
    });
  }

  /**
   * 获取用户权限代码列表
   * @param user 用户对象（需要包含组织和角色信息）
   * @returns 权限代码数组
   */
  public getUserPermissions(user: any): string[] {
    // 从机构角色中获取所有权限
    const permissions = new Set<string>();
    
    if (user.organization?.roles) {
      for (const role of user.organization.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            permissions.add(permission.code);
          }
        }
      }
    }
    
    return Array.from(permissions);
  }
} 