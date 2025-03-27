import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(queryParams?: any): Promise<any> {
    const { current = 1, pageSize = 20, username, name, organization, status } = queryParams || {};
    
    // 构建查询条件
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
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
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
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
      
      const queryBuilder = this.usersRepository.createQueryBuilder('user')
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
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    
    if (existingUser) {
      throw new ConflictException(`用户名 ${username} 已存在`);
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户基本信息
    const user = this.usersRepository.create({
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
    const savedUser = await this.usersRepository.save(user);
    
    return this.transformToFrontendFormat(savedUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    // admin用户（ID为1）不可编辑
    if (id === 1) {
      throw new ConflictException('admin用户不可编辑');
    }
    
    // 先获取原始用户数据
    const existingUser = await this.usersRepository.findOne({
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
    
    console.log('处理后的用户数据:', {
      ...userData,
      organization_id,
      status: userData.status
    });
    
    // 更新用户基本信息
    Object.assign(existingUser, userData);
    
    // 如果提供了组织ID，更新组织关系
    if (organization_id) {
      existingUser.organization = { id: organization_id } as any;
    }
    
    console.log('更新用户数据:', existingUser);
    
    // 保存更新后的用户
    const updatedUser = await this.usersRepository.save(existingUser);
    
    return this.transformToFrontendFormat(updatedUser);
  }

  async remove(id: number): Promise<void> {
    // admin用户（ID为1）不可删除
    if (id === 1) {
      throw new ConflictException('admin用户不可删除');
    }
    
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
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