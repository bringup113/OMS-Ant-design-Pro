import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PermissionBit } from '../permissions/decorators/permissions.decorator';
import { Permission } from '../permissions/entities/permission.entity';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const configService = new ConfigService();

// 创建数据源
const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST') || 'localhost',
  port: parseInt(configService.get('DATABASE_PORT') || '5432', 10),
  username: configService.get('DATABASE_USERNAME') || 'postgres',
  password: configService.get('DATABASE_PASSWORD') || 'postgres',
  database: configService.get('DATABASE_NAME') || 'oms',
  entities: [Permission],
  synchronize: false,
});

// 功能权限对应表
const functionPermissionMap = {
  // 查询权限
  'query': PermissionBit.VIEW,
  'list': PermissionBit.VIEW,
  'get': PermissionBit.VIEW,
  'view': PermissionBit.VIEW,
  'search': PermissionBit.VIEW,
  'export': PermissionBit.VIEW,
  
  // 编辑权限
  'add': PermissionBit.EDIT,
  'create': PermissionBit.EDIT,
  'edit': PermissionBit.EDIT,
  'update': PermissionBit.EDIT,
  'save': PermissionBit.EDIT,
  
  // 删除权限
  'delete': PermissionBit.DELETE,
  'remove': PermissionBit.DELETE,
  
  // 管理权限
  'admin': PermissionBit.ADMIN,
  'manage': PermissionBit.ADMIN,
  'config': PermissionBit.ADMIN,
  'settings': PermissionBit.ADMIN,
};

async function initPermissionValues() {
  try {
    // 初始化数据源
    await dataSource.initialize();
    console.log('数据源已初始化');
    
    // 查询所有权限
    const permissions = await dataSource.getRepository(Permission).find();
    console.log(`查询到 ${permissions.length} 条权限记录`);
    
    let updatedCount = 0;
    
    // 批量更新权限值
    for (const permission of permissions) {
      let permissionValue = 0;
      
      // 根据code值设置permission_value
      if (permission.code.includes(':')) {
        // 对于形如 "user:add" 的权限
        const action = permission.code.split(':')[1];
        
        // 查找匹配的权限位
        for (const [key, value] of Object.entries(functionPermissionMap)) {
          if (action.includes(key)) {
            permissionValue |= value;
          }
        }
      } else if (permission.type === 'menu') {
        // 菜单默认具有查看权限
        permissionValue = PermissionBit.VIEW;
      }
      
      // 如果计算出了权限值且与当前值不同，则更新
      if (permissionValue > 0 && permission.permission_value !== permissionValue) {
        permission.permission_value = permissionValue;
        await dataSource.getRepository(Permission).save(permission);
        updatedCount++;
        console.log(`更新权限 [${permission.name}] code=[${permission.code}], value=${permissionValue}`);
      }
    }
    
    console.log(`共更新了 ${updatedCount} 条权限记录`);
    
    // 关闭数据源
    await dataSource.destroy();
    console.log('数据源已关闭');
  } catch (error) {
    console.error('初始化权限值时出错:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// 执行初始化
initPermissionValues(); 