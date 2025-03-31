import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataPermission } from './entities/data-permission.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DataPermissionsService {
  constructor(
    @InjectRepository(DataPermission)
    private readonly dataPermissionRepository: Repository<DataPermission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 根据用户和资源类型获取数据权限过滤条件
   * 简化版：只支持"全部数据"和"机构数据"两种数据范围
   * @param user 用户对象
   * @param type 资源类型
   * @returns 数据过滤条件和参数
   */
  async getDataFilter(user: User, type: string): Promise<{ filter: string; params: any }> {
    try {
      console.log(`获取用户 ${user.id}:${user.username} 的 ${type} 数据权限`);
      
      // 如果传入的用户对象不完整（如来自JWT解码），则从数据库获取完整用户信息
      let fullUser = user;
      if (!user.organization && user.id) {
        console.log(`JWT中没有用户组织信息，尝试从数据库获取完整用户信息`);
        const dbUser = await this.userRepository.findOne({
          where: { id: user.id },
          relations: ['organization', 'organization.roles']
        });
        
        if (dbUser) {
          console.log(`成功获取用户完整信息:`, {
            id: dbUser.id,
            username: dbUser.username,
            data_scope: dbUser.data_scope,
            organizationId: dbUser.organization?.id
          });
          fullUser = dbUser;
        } else {
          console.warn(`无法从数据库获取用户 ${user.id}:${user.username} 的信息`);
        }
      }
      
      // 检查用户是否有超级管理员角色，有则可以查看全部数据
      const isAdmin = fullUser.organization?.roles?.some(role => role.code === 'admin');
      
      if (isAdmin) {
        console.log(`用户 ${fullUser.username} 的组织角色具有管理员权限，可查看全部数据`);
        return { filter: '1=1', params: {} };
      }

      // 检查用户的数据范围配置
      if (fullUser.data_scope === 'all') {
        console.log(`用户 ${fullUser.username} 的数据范围是"全部"，不需要过滤`);
        return { filter: '1=1', params: {} };
      }
      
      // 如果数据范围是organization且有组织ID，则根据组织ID过滤
      if (fullUser.data_scope === 'organization' && fullUser.organization?.id) {
        console.log(`用户 ${fullUser.username} 使用机构数据范围，过滤条件为机构ID ${fullUser.organization.id}`);
        
        // 根据资源类型返回相应的过滤条件
        switch (type) {
          case 'order':
            return {
              filter: 'order.supplier_id = :organizationId',
              params: { organizationId: fullUser.organization.id },
            };
          case 'quotation':
            return {
              filter: 'quotation.supplier_id = :organizationId',
              params: { organizationId: fullUser.organization.id },
            };
          case 'bill':
            return {
              filter: 'supplier.id = :organizationId',
              params: { organizationId: fullUser.organization.id },
            };
          case 'customer':
            return {
              filter: 'customer.organization_id = :organizationId',
              params: { organizationId: fullUser.organization.id },
            };
          case 'user':
            return {
              filter: 'user.organization_id = :organizationId',
              params: { organizationId: fullUser.organization.id },
            };
          default:
            return {
              filter: 'organization_id = :organizationId',
              params: { organizationId: fullUser.organization.id },
            };
        }
      }
      
      // 如果用户没有组织且数据范围不是"全部"，则不能看到任何数据
      console.log(`用户 ${fullUser.username} 的数据范围是"机构"，但没有组织信息，默认不能看到任何数据`);
      return { filter: '1=0', params: {} }; // 1=0 始终为假，表示不返回任何数据
    } catch (error) {
      console.error(`计算用户 ${user?.username} 的数据权限时出错:`, error);
      // 出错时，默认不能看到任何数据，保证安全
      return { filter: '1=0', params: {} };
    }
  }

  /**
   * 创建或更新数据权限规则
   * @param dataPermission 数据权限对象
   * @returns 保存后的数据权限对象
   */
  async saveDataPermission(dataPermission: Partial<DataPermission>): Promise<DataPermission> {
    return this.dataPermissionRepository.save(dataPermission);
  }

  /**
   * 删除数据权限规则
   * @param id 数据权限ID
   */
  async removeDataPermission(id: number): Promise<void> {
    await this.dataPermissionRepository.delete(id);
  }

  /**
   * 获取数据权限规则列表
   * @param roleId 角色ID
   * @param resource 资源名称
   * @returns 数据权限规则列表
   */
  async findDataPermissions(roleId?: number, resource?: string): Promise<DataPermission[]> {
    const where: any = {};
    if (roleId) {
      where.role_id = roleId;
    }
    if (resource) {
      where.resource = resource;
    }

    return this.dataPermissionRepository.find({
      where,
      relations: ['role'],
      order: { id: 'DESC' },
    });
  }
} 