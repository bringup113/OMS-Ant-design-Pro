import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // 检查用户状态
    if (user.status !== '1') {
      throw new UnauthorizedException('用户已被禁用');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 获取用户权限
    const permissions = this.getUserPermissions(user);

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles.map(role => role.code),
      permissions,
    };

    // 返回前端期望的格式
    return {
      status: 'ok',
      type: 'account',
      currentAuthority: user.roles.map(role => role.code).join(','),
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        organization: user.organization,
        roles: user.roles,
        permissions,
      },
    };
  }

  private getUserPermissions(user: any): string[] {
    const permissionSet = new Set<string>();
    
    // 从用户角色中获取权限
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach(role => {
        if (role.permissions && role.permissions.length > 0) {
          role.permissions.forEach(permission => {
            permissionSet.add(permission.code);
          });
        }
      });
    }
    
    return Array.from(permissionSet);
  }
} 