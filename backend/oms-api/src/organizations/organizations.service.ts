import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, ILike } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<any> {
    // 检查机构代码是否已存在
    if (createOrganizationDto.code) {
      const existingOrg = await this.organizationsRepository.findOne({
        where: { code: createOrganizationDto.code },
      });
      
      if (existingOrg) {
        throw new ConflictException(`机构代码 ${createOrganizationDto.code} 已存在`);
      }
    }
    
    try {
      // 重置序列，确保从当前最大ID开始
      await this.organizationsRepository.query(
        "SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations) + 1, false);"
      );
      
      // 创建新机构对象，但不设置ID，让数据库自动生成
      const organization = new Organization();
      organization.name = createOrganizationDto.name;
      
      // 条件赋值，如果有code就设置，没有就不设置
      if (createOrganizationDto.code) {
        organization.code = createOrganizationDto.code;
      }
      
      organization.sort = createOrganizationDto.sort || 0;
      organization.status = createOrganizationDto.status || '1';
      
      if (createOrganizationDto.parentId) {
        const parentId = typeof createOrganizationDto.parentId === 'string' 
          ? parseInt(createOrganizationDto.parentId) 
          : createOrganizationDto.parentId;
          
        const parent = await this.organizationsRepository.findOne({ 
          where: { id: parentId } 
        });
        
        if (parent) {
          organization.parent = parent;
        }
      }
      
      // 确保没有设置ID，让数据库自动生成
      delete (organization as any).id;
      
      // 使用save方法保存实体
      const savedOrg = await this.organizationsRepository.save(organization);
      
      // 转换为前端需要的格式
      return this.transformToFrontendFormat(savedOrg);
    } catch (error) {
      console.error('创建机构错误:', error);
      
      // 捕获并处理可能的错误
      if (error.code === '23505') { // 唯一约束冲突
        if (error.detail && error.detail.includes('organizations_pkey')) {
          throw new ConflictException('创建机构失败：主键冲突，请联系管理员');
        } else if (error.detail && error.detail.includes('organizations_code_key')) {
          throw new ConflictException('创建机构失败：机构代码已存在');
        } else {
          throw new ConflictException('创建机构失败：数据冲突');
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
    
    const [organizations, total] = await this.organizationsRepository.findAndCount({
      where: whereConditions,
      relations: ['parent'],
      skip,
      take,
      order: { sort: 'ASC' },
    });
    
    // 转换为前端需要的格式
    const transformedOrgs = organizations.map(org => this.transformToFrontendFormat(org));
    
    return [transformedOrgs, total];
  }

  async findOne(id: number): Promise<any> {
    const organization = await this.organizationsRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    // 转换为前端需要的格式
    return this.transformToFrontendFormat(organization);
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto): Promise<any> {
    const organization = await this.organizationsRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    // 检查机构代码是否已存在
    if (updateOrganizationDto.code && updateOrganizationDto.code !== organization.code) {
      const existingOrg = await this.organizationsRepository.findOne({
        where: { code: updateOrganizationDto.code },
      });
      
      if (existingOrg && existingOrg.id !== id) {
        throw new ConflictException(`机构代码 ${updateOrganizationDto.code} 已存在`);
      }
    }
    
    // 更新基本字段
    if (updateOrganizationDto.name !== undefined) organization.name = updateOrganizationDto.name;
    if (updateOrganizationDto.code !== undefined) organization.code = updateOrganizationDto.code;
    if (updateOrganizationDto.sort !== undefined) organization.sort = updateOrganizationDto.sort;
    if (updateOrganizationDto.status !== undefined) organization.status = updateOrganizationDto.status;
    
    // 处理父级机构
    if (updateOrganizationDto.parentId) {
      // 检查是否将机构设置为自己的子机构
      if (updateOrganizationDto.parentId.toString() === id.toString()) {
        throw new ConflictException('不能将机构设置为自己的子机构');
      }
      
      const parentId = typeof updateOrganizationDto.parentId === 'string' 
        ? parseInt(updateOrganizationDto.parentId) 
        : updateOrganizationDto.parentId;
        
      const parent = await this.organizationsRepository.findOne({ 
        where: { id: parentId } 
      });
      
      if (parent) {
        organization.parent = parent;
      }
    } else if (updateOrganizationDto.parentId === null || updateOrganizationDto.parentId?.toString() === '0') {
      // 使用 TypeORM 的方式处理关系为 null
      await this.organizationsRepository
        .createQueryBuilder()
        .relation(Organization, "parent")
        .of(organization)
        .set(null);
    }
    
    const savedOrg = await this.organizationsRepository.save(organization);
    
    // 转换为前端需要的格式
    return this.transformToFrontendFormat(savedOrg);
  }

  async remove(id: number): Promise<void> {
    // 检查是否有子机构
    const children = await this.organizationsRepository.find({
      where: { parent: { id } },
    });
    
    if (children.length > 0) {
      const childNames = children.map(child => child.name).join(', ');
      throw new ConflictException(`该机构下有 ${children.length} 个子机构（${childNames}），请先删除子机构`);
    }
    
    // 检查是否有用户关联
    const usersCount = await this.organizationsRepository.query(
      'SELECT COUNT(*) as count FROM users WHERE organization_id = $1',
      [id]
    );
    
    if (parseInt(usersCount[0].count) > 0) {
      throw new ConflictException(`该机构下有 ${usersCount[0].count} 个用户，请先将用户转移到其他机构`);
    }
    
    const organization = await this.organizationsRepository.findOne({
      where: { id },
    });
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    await this.organizationsRepository.remove(organization);
  }
  
  // 将数据库实体转换为前端需要的格式
  private transformToFrontendFormat(organization: Organization): any {
    return {
      id: organization.id.toString(),
      key: organization.id.toString(),
      name: organization.name,
      code: organization.code,
      parentId: organization.parent ? organization.parent.id.toString() : '0',
      parentName: organization.parent ? organization.parent.name : '-',
      sort: organization.sort,
      status: organization.status,
      createdAt: organization.created_at.toISOString(),
    };
  }
} 