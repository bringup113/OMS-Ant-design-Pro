import { SetMetadata } from '@nestjs/common';

/**
 * 定义权限位值 - 使用二进制位表示基本权限
 */
export enum PermissionBit {
  VIEW = 1,           // 0001 - 查看权限
  EDIT = 2,           // 0010 - 编辑权限
  DELETE = 4,         // 0100 - 删除权限
  ADMIN = 8,          // 1000 - 管理权限
}

/**
 * 需要权限装饰器 - 使用位运算判断权限
 * @param value 权限位值
 */
export const RequirePermission = (value: number) => SetMetadata('permission_value', value);

// 简化的辅助装饰器
export const CanView = () => RequirePermission(PermissionBit.VIEW);
export const CanEdit = () => RequirePermission(PermissionBit.EDIT);
export const CanDelete = () => RequirePermission(PermissionBit.DELETE);
export const CanAdmin = () => RequirePermission(PermissionBit.ADMIN);

// 组合权限
export const CanViewAndEdit = () => RequirePermission(PermissionBit.VIEW | PermissionBit.EDIT);
export const CanViewAndDelete = () => RequirePermission(PermissionBit.VIEW | PermissionBit.DELETE);
export const CanEditAndDelete = () => RequirePermission(PermissionBit.EDIT | PermissionBit.DELETE);
export const CanManageAll = () => RequirePermission(PermissionBit.VIEW | PermissionBit.EDIT | PermissionBit.DELETE | PermissionBit.ADMIN); 