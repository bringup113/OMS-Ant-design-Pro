import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  /**
   * 获取所有权限
   * @returns 权限列表
   */
  async findAll(): Promise<Permission[]> {
    // 使用原始SQL查询，确保包含parent_id字段
    const permissions = await this.permissionsRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.parent', 'parent')
      .orderBy({
        'permission.type': 'ASC',
        'permission.sort': 'ASC',
        'permission.id': 'ASC'
      })
      .getMany();

    // 处理结果，确保每个权限对象包含parent_id字段
    return permissions.map(permission => {
      const result: any = { ...permission };
      if (permission.parent) {
        result.parent_id = permission.parent.id;
      }
      return result;
    });
  }
} 