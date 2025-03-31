import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async findAll(queryParams?: any): Promise<any> {
    const { current = 1, pageSize = 20, username, name, organization, status } = queryParams || {};
    
    // 构建查询条件
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization');
    
    // 添加过滤条件
    if (username) {
      queryBuilder.andWhere('user.username ILIKE :username', { username: `%${username}%` });
    }
    
    if (name) {
      queryBuilder.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }
    
    if (organization) {
      queryBuilder.andWhere('organization.code = :organization', { organization });
    }
    
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    
    // 计算总数
    const total = await queryBuilder.getCount();
    
    // 分页
    const users = await queryBuilder
      .skip((current - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    // 转换为前端需要的格式
    const transformedUsers = users.map(user => this.transformToFrontendFormat(user));
    
    return {
      data: transformedUsers,
      total,
      success: true
    };
  }

  async findOne(id: number): Promise<User> {
    console.log('查找用户，ID:', id);
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('organization.roles', 'organizationRoles')
      .leftJoinAndSelect('organizationRoles.permissions', 'permissions')
      .where('user.id = :id', { id });

    console.log('SQL查询:', queryBuilder.getSql());
    
    const user = await queryBuilder.getOne();
    
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    console.log('查找到的用户:', {
      id: user.id,
      username: user.username,
      organizationId: user.organization?.id,
      organizationRoles: user.organization?.roles?.length
    });
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      console.log('开始通过用户名查找用户:', username);
      
      const queryBuilder = this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.organization', 'organization')
        .leftJoinAndSelect('organization.roles', 'organizationRoles')
        .leftJoinAndSelect('organizationRoles.permissions', 'permissions')
        .where('user.username = :username', { username });

      console.log('SQL查询:', queryBuilder.getSql());
      
      const user = await queryBuilder.getOne();
      console.log('查询结果:', user ? {
        id: user.id,
        username: user.username,
        status: user.status,
        hasPassword: !!user.password,
        organizationId: user.organization?.id,
        organizationRoles: user.organization?.roles?.length
      } : null);
      
      return user;
    } catch (error) {
      console.error('查找用户时发生错误:', error);
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { username, password, organization_id, ...userData } = createUserDto;
    
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    
    if (existingUser) {
      throw new ConflictException(`用户名 ${username} 已存在`);
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 特殊处理email字段，允许为空字符串或null
    if (userData.email === '' || userData.email === undefined || userData.email === null || userData.email === 'null') {
      (userData as any).email = null;
    }
    
    // 确保email字段符合预期格式
    if ((userData as any).email !== null && typeof (userData as any).email !== 'string') {
      console.warn(`邮箱字段格式异常，类型为 ${typeof (userData as any).email}，值为:`, (userData as any).email);
      (userData as any).email = String((userData as any).email) || null;
    }
    
    // 创建用户基本信息
    const user = this.userRepository.create({
      ...userData,
      username,
      password: hashedPassword,
    });
    
    // 如果提供了组织ID，设置组织关系
    if (organization_id) {
      user.organization = { id: organization_id } as any;
    }
    
    console.log('创建用户数据:', user);
    
    // 保存用户
    const savedUser = await this.userRepository.save(user);
    
    return this.transformToFrontendFormat(savedUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    // admin用户（ID为1）不可编辑
    if (id === 1) {
      throw new ConflictException('admin用户不可编辑');
    }
    
    // 先获取原始用户数据
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    
    if (!existingUser) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // 处理组织关系
    const { organization_id, ...userData } = updateUserDto as any;
    
    // 确保状态值是字符串
    if (userData.status !== undefined) {
      userData.status = userData.status.toString();
    }
    
    // 特殊处理email字段，允许为空字符串或null
    if (userData.email === '' || userData.email === undefined || userData.email === null || userData.email === 'null') {
      userData.email = null;
    }
    
    // 确保email字段符合预期格式
    if (userData.email !== null && typeof userData.email !== 'string') {
      console.warn(`邮箱字段格式异常，类型为 ${typeof userData.email}，值为:`, userData.email);
      userData.email = String(userData.email) || null;
    }
    
    // 检查是否修改了数据范围
    const isDataScopeChanged = userData.data_scope !== undefined && 
                              userData.data_scope !== existingUser.data_scope;
    
    // 记录更新前的状态
    console.log('更新前的用户数据:', {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      data_scope: existingUser.data_scope,
      organization_id: existingUser.organization?.id
    });
    
    console.log('更新请求的数据:', {
      ...userData,
      organization_id,
      email: userData.email,
      data_scope: userData.data_scope
    });
    
    // 更新用户基本信息
    Object.assign(existingUser, userData);
    
    // 如果提供了组织ID，更新组织关系
    if (organization_id) {
      existingUser.organization = { id: organization_id } as any;
    }
    
    try {
      // 保存更新后的用户
      const updatedUser = await this.userRepository.save(existingUser);
      console.log('用户更新成功:', {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        data_scope: updatedUser.data_scope,
        organization_id: updatedUser.organization?.id
      });
      
      // 清除用户权限缓存
      if (isDataScopeChanged) {
        try {
          // 用户权限值缓存
          await this.cacheManager.del(`user_permission_value_${id}`);
          // 用户权限列表缓存
          await this.cacheManager.del(`user_permissions_${id}`);
          
          console.log(`已清除用户 ${id} 的权限缓存，因为数据范围从 ${existingUser.data_scope} 更改为 ${userData.data_scope}`);
        } catch (error) {
          console.error('清除用户权限缓存失败:', error);
        }
      }
      
      return this.transformToFrontendFormat(updatedUser);
    } catch (error) {
      console.error('更新用户失败:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    // admin用户（ID为1）不可删除
    if (id === 1) {
      throw new ConflictException('admin用户不可删除');
    }
    
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
  
  /**
   * 更新用户数据范围
   * @param id 用户ID
   * @param dataScope 数据范围
   * @returns 更新后的用户
   */
  async updateDataScope(id: number, dataScope: string): Promise<any> {
    console.log(`开始更新用户 ${id} 的数据范围为 ${dataScope}`);
    
    // 验证数据范围值是否合法
    if (!['all', 'organization'].includes(dataScope)) {
      console.warn(`数据范围值不合法: ${dataScope}，将使用默认值 'organization'`);
      dataScope = 'organization';
    }

    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!existingUser) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    const isDataScopeChanged = dataScope !== existingUser.data_scope;

    console.log('更新数据范围:', {
      id,
      original_data_scope: existingUser.data_scope,
      new_data_scope: dataScope,
    });

    // 更新数据范围
    existingUser.data_scope = dataScope;
    await this.userRepository.save(existingUser);

    // 如果数据范围发生变化，清除用户权限缓存
    if (isDataScopeChanged) {
      await this.authService.clearUserPermissionsCache(id);
      console.log(`已清除用户 ${id} 的权限缓存${isDataScopeChanged ? '，因为数据范围从 ' + existingUser.data_scope + ' 更改为 ' + dataScope : ''}`);
    }

    return {
      success: true,
      message: '数据范围更新成功',
    };
  }
  
  // 转换为前端需要的格式
  private transformToFrontendFormat(user: User): any {
    return {
      id: user.id.toString(),
      key: user.id.toString(),
      username: user.username,
      name: user.name,
      email: user.email || '',
      organization: user.organization?.code || '',
      organization_id: user.organization?.id,
      organization_name: user.organization?.name,
      status: user.status,
      createdAt: user.created_at.toISOString(),
      avatar: user.avatar,
      profile: user.profile || '',
      data_scope: user.data_scope,
    };
  }
} 