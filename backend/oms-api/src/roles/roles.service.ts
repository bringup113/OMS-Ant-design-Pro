import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, ILike } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from '../permissions/entities/permission.entity';
import { Organization } from '../organizations/entities/organization.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<any> {
    // 检查角色代码是否已存在
    if (createRoleDto.code) {
      const existingRole = await this.rolesRepository.findOne({
        where: { code: createRoleDto.code },
      });
      
      if (existingRole) {
        throw new ConflictException(`角色代码 ${createRoleDto.code} 已存在`);
      }
    }
    
    try {
      // 重置序列，确保从当前最大ID开始
      await this.rolesRepository.query(
        "SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles) + 1, false);"
      );
      
      const role = this.rolesRepository.create({
        name: createRoleDto.name,
        code: createRoleDto.code,
        description: createRoleDto.description,
        sort: createRoleDto.sort || 0,
        status: createRoleDto.status || '1',
        data_scope: createRoleDto.dataScope || 'self',
      });
      
      // 处理权限关联
      if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
        const permissions = await this.permissionsRepository.find({
          where: { code: In(createRoleDto.permissions) },
        });
        role.permissions = permissions;
      }
      
      // 处理组织机构关联
      if (createRoleDto.organizations && createRoleDto.organizations.length > 0) {
        const organizations = await this.organizationsRepository.find({
          where: { code: In(createRoleDto.organizations) },
        });
        role.organizations = organizations;
      }
      
      // 确保没有设置ID，让数据库自动生成
      delete (role as any).id;
      
      const savedRole = await this.rolesRepository.save(role);
      
      // 转换为前端需要的格式
      return this.transformToFrontendFormat(savedRole);
    } catch (error) {
      console.error('创建角色错误:', error);
      
      // 捕获并处理可能的错误
      if (error.code === '23505') { // 唯一约束冲突
        if (error.detail && error.detail.includes('roles_pkey')) {
          throw new ConflictException('创建角色失败：主键冲突，请联系管理员');
        } else if (error.detail && error.detail.includes('roles_code_key')) {
          throw new ConflictException('创建角色失败：角色代码已存在');
        } else {
          throw new ConflictException('创建角色失败：数据冲突');
        }
      }
      throw error;
    }
  }

  async findAll(filters: any, page = 1, pageSize = 10): Promise<[any[], number]> {
    const skip = (page - 1) * pageSize;
    const take = pageSize ? +pageSize : undefined;
    
    const whereConditions: any = {};
    
    if (filters.name) {
      whereConditions.name = ILike(`%${filters.name}%`);
    }
    
    if (filters.code) {
      whereConditions.code = ILike(`%${filters.code}%`);
    }
    
    if (filters.status) {
      whereConditions.status = filters.status;
    }
    
    let queryBuilder = this.rolesRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .leftJoinAndSelect('role.organizations', 'organization');
    
    // 应用基本过滤条件
    if (whereConditions.name) {
      queryBuilder = queryBuilder.andWhere('role.name ILIKE :name', { name: whereConditions.name });
    }
    
    if (whereConditions.code) {
      queryBuilder = queryBuilder.andWhere('role.code ILIKE :code', { code: whereConditions.code });
    }
    
    if (whereConditions.status) {
      queryBuilder = queryBuilder.andWhere('role.status = :status', { status: whereConditions.status });
    }
    
    // 根据组织代码过滤角色
    if (filters.organization) {
      queryBuilder = queryBuilder.andWhere('organization.code = :orgCode', { orgCode: filters.organization });
    }
    
    // 添加排序、分页
    queryBuilder = queryBuilder
      .orderBy('role.sort', 'ASC')
      .skip(skip)
      .take(take);
    
    const [roles, total] = await queryBuilder.getManyAndCount();
    
    // 转换为前端需要的格式
    const transformedRoles = roles.map(role => this.transformToFrontendFormat(role));
    
    return [transformedRoles, total];
  }

  async findOne(id: number): Promise<any> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions', 'organizations'],
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    // 转换为前端需要的格式
    return this.transformToFrontendFormat(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<any> {
    // 超级管理员角色（ID为1）不可编辑
    if (id === 1) {
      throw new ConflictException('超级管理员角色不可编辑');
    }
    
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions', 'organizations'],
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    // 检查角色代码是否已存在
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.rolesRepository.findOne({
        where: { code: updateRoleDto.code },
      });
      
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(`角色代码 ${updateRoleDto.code} 已存在`);
      }
    }
    
    // 更新基本字段
    if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name;
    if (updateRoleDto.code !== undefined) role.code = updateRoleDto.code;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
    if (updateRoleDto.sort !== undefined) role.sort = updateRoleDto.sort;
    if (updateRoleDto.status !== undefined) role.status = updateRoleDto.status;
    if (updateRoleDto.dataScope !== undefined) role.data_scope = updateRoleDto.dataScope;
    
    // 处理权限关联
    if (updateRoleDto.permissions) {
      const permissions = await this.permissionsRepository.find({
        where: { code: In(updateRoleDto.permissions) },
      });
      role.permissions = permissions;
    }
    
    // 处理组织机构关联
    if (updateRoleDto.organizations) {
      const organizations = await this.organizationsRepository.find({
        where: { code: In(updateRoleDto.organizations) },
      });
      role.organizations = organizations;
    }
    
    const savedRole = await this.rolesRepository.save(role);
    
    // 转换为前端需要的格式
    return this.transformToFrontendFormat(savedRole);
  }

  async remove(id: number): Promise<void> {
    // 超级管理员角色（ID为1）和供应商角色（ID为2）不可删除
    if (id === 1) {
      throw new ConflictException('超级管理员角色不可删除');
    }
    
    if (id === 2) {
      throw new ConflictException('供应商角色不可删除');
    }
    
    // 检查是否有用户关联
    const usersCount = await this.rolesRepository.query(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
      [id]
    );
    
    if (parseInt(usersCount[0].count) > 0) {
      throw new ConflictException(`该角色下有 ${usersCount[0].count} 个用户，请先解除用户与角色的关联`);
    }
    
    const role = await this.rolesRepository.findOne({
      where: { id },
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    await this.rolesRepository.remove(role);
  }
  
  // 将数据库实体转换为前端需要的格式
  private transformToFrontendFormat(role: Role): any {
    // 提取组织机构代码列表
    const organizations = role.organizations ? role.organizations.map(org => org.code) : [];
    
    // 提取权限代码列表
    const permissions = role.permissions ? role.permissions.map(perm => perm.code) : [];
    
    // 确保返回的数据格式与前端期望的格式完全一致
    return {
      id: role.id.toString(),
      key: role.id.toString(),
      name: role.name,
      code: role.code,
      description: role.description || '',
      sort: role.sort,
      status: role.status,
      dataScope: role.data_scope,
      createdAt: role.created_at.toISOString(),
      permissions: permissions,
      organizations: organizations,
    };
  }
} 