import { Injectable, NotFoundException } from '@nestjs/common';
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
    const { current = 1, pageSize = 20, username, name, organization, role, status } = queryParams || {};
    
    // 构建查询条件
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.roles', 'roles');
    
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
    
    if (role) {
      queryBuilder.andWhere('roles.code = :role', { role });
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

  async findOne(id: number): Promise<any> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['organization', 'roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    return this.transformToFrontendFormat(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { username },
      relations: ['organization', 'roles'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
    });
    
    const savedUser = await this.usersRepository.save(user);
    return this.transformToFrontendFormat(savedUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.findOne(id);
    
    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });
    
    return this.transformToFrontendFormat(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
  
  // 转换为前端需要的格式
  private transformToFrontendFormat(user: User): any {
    // 获取角色代码
    const role = user.roles && user.roles.length > 0 ? user.roles[0].code.toLowerCase() : 'user';
    
    // 获取组织机构代码
    const organization = user.organization ? user.organization.code : '';
    
    return {
      id: user.id.toString(),
      key: user.id.toString(),
      username: user.username,
      name: user.name,
      email: user.email || '',
      organization: organization,
      role: role,
      status: user.status,
      createdAt: user.created_at.toISOString(),
      avatar: user.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      profile: user.profile || '',
      dataScope: user.data_scope,
    };
  }
} 