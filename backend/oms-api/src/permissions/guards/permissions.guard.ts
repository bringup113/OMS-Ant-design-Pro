import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissionValue = this.reflector.get<number>('permission_value', context.getHandler());
    
    // 如果没有定义权限要求，允许访问
    if (!requiredPermissionValue) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // 如果没有用户信息，拒绝访问
    if (!user) {
      throw new UnauthorizedException('未授权访问');
    }
    
    // 获取用户的权限值
    const userPermissionValue = await this.authService.calculateUserPermissions(user);
    
    // 使用位运算判断是否有权限访问
    return (userPermissionValue & requiredPermissionValue) === requiredPermissionValue;
  }
} 