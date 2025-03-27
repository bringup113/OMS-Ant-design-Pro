/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
import type { InitialState } from '@/app';

/**
 * 权限位定义
 */
export enum PermissionBit {
  VIEW = 1,           // 0001 - 查看权限
  EDIT = 2,           // 0010 - 编辑权限
  DELETE = 4,         // 0100 - 删除权限
  ADMIN = 8,          // 1000 - 管理权限
}

export default function access(initialState: InitialState | undefined) {
  const { currentUser } = initialState ?? {};
  
  // 权限工具函数 - 检查是否有指定的权限
  const hasPermission = (permissionCode: string): boolean => {
    if (!currentUser || !currentUser.permissions) {
      return false;
    }
    return currentUser.permissions.includes(permissionCode);
  };
  
  // 基于位运算的权限检查
  const hasPermissionBit = (requiredBits: number): boolean => {
    if (!currentUser || !currentUser.permissionValue) {
      return false;
    }
    // 使用位与运算检查是否拥有所有必需的权限位
    return (currentUser.permissionValue & requiredBits) === requiredBits;
  };
  
  // 常用权限组合快捷方法
  const canView = (module: string): boolean => hasPermission(`${module}:view`) || hasPermission(`${module}:query`);
  const canAdd = (module: string): boolean => hasPermission(`${module}:add`) || hasPermission(`${module}:create`);
  const canEdit = (module: string): boolean => hasPermission(`${module}:edit`) || hasPermission(`${module}:update`);
  const canDelete = (module: string): boolean => hasPermission(`${module}:delete`) || hasPermission(`${module}:remove`);
  
  // 是否是超级管理员或管理员
  const isAdmin = (): boolean => {
    if (!currentUser || !currentUser.roles) {
      return false;
    }
    return currentUser.roles.some(role => 
      role.code === 'SUPER_ADMIN' || role.code === 'ADMIN'
    );
  };

  return {
    // 通用权限设置
    canView: (module: string) => isAdmin() || canView(module),
    canAdd: (module: string) => isAdmin() || canAdd(module),
    canEdit: (module: string) => isAdmin() || canEdit(module),
    canDelete: (module: string) => isAdmin() || canDelete(module),
    hasPermission: (code: string) => isAdmin() || hasPermission(code),
    hasPermissionBit: (bits: number) => isAdmin() || hasPermissionBit(bits),
    
    // 角色特定权限
    isAdmin: isAdmin(),
    isUser: currentUser && !isAdmin(),
    
    // 菜单权限
    canAdmin: isAdmin() || hasPermission('system'),
    canViewUsers: isAdmin() || hasPermission('system.user-list'),
    canViewRoles: isAdmin() || hasPermission('system.role'),
    canViewOrganizations: isAdmin() || hasPermission('system.organization'),
    canViewProducts: isAdmin() || hasPermission('product'),
    canViewCustomers: isAdmin() || hasPermission('customer'),
    canViewOrders: isAdmin() || hasPermission('order'),
    canViewBills: isAdmin() || hasPermission('order.bill-management'),
    canViewProfits: isAdmin() || hasPermission('profit'),
    canViewDashboard: isAdmin() || hasPermission('dashboard'),
  };
}
