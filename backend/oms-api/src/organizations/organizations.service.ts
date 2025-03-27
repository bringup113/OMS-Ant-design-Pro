import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
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
      organization.code = createOrganizationDto.code || '';
      organization.status = createOrganizationDto.status || '1';
      organization.type = 'customer'; // 默认为客户类型
      
      if (createOrganizationDto.parentId) {
        const parent = await this.organizationsRepository.findOne({
          where: { id: createOrganizationDto.parentId },
        });
        
        if (!parent) {
          throw new NotFoundException(`Parent organization with ID ${createOrganizationDto.parentId} not found`);
        }
        
        organization.parent = parent;
        
        // 如果父级是供应商，设置合作方式
        if (parent.type === 'supplier') {
          organization.cooperation_type = createOrganizationDto.cooperation_type || 'no_commission';
          
          // 如果选择了利润分佣，保存佣金比例
          if (organization.cooperation_type === 'profit_commission' && createOrganizationDto.commission_rate !== undefined) {
            organization.commission_rate = createOrganizationDto.commission_rate;
          }
        }
      }
      
      // 确保没有设置ID，让数据库自动生成
      delete (organization as any).id;
      
      // 使用save方法保存实体
      const savedOrg = await this.organizationsRepository.save(organization);
      
      // 更新排序值为ID
      savedOrg.sort = savedOrg.id;
      await this.organizationsRepository.save(savedOrg);
      
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
    // 检查 ID 是否为有效数字
    if (!id || isNaN(id)) {
      throw new NotFoundException(`Invalid organization ID`);
    }

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
    // 总部机构（ID为1）和供应商机构（ID为2）不可编辑
    if (id === 1 || id === 2) {
      throw new ConflictException(`ID为${id}的机构不可编辑`);
    }
    
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
    
    try {
      // 更新基本字段
      if (updateOrganizationDto.name !== undefined) organization.name = updateOrganizationDto.name;
      if (updateOrganizationDto.code !== undefined) organization.code = updateOrganizationDto.code;
      if (updateOrganizationDto.status !== undefined) organization.status = updateOrganizationDto.status;
      
      // 处理父级机构
      if (updateOrganizationDto.parentId) {
        const parent = await this.organizationsRepository.findOne({
          where: { id: updateOrganizationDto.parentId },
        });
        
        if (!parent) {
          throw new NotFoundException(`Parent organization with ID ${updateOrganizationDto.parentId} not found`);
        }
        
        organization.parent = parent;
        
        // 如果父级是供应商，设置合作方式
        if (parent.type === 'supplier') {
          organization.cooperation_type = updateOrganizationDto.cooperation_type || organization.cooperation_type || 'no_commission';
          
          // 如果选择了利润分佣，保存佣金比例
          if (organization.cooperation_type === 'profit_commission' && updateOrganizationDto.commission_rate !== undefined) {
            organization.commission_rate = updateOrganizationDto.commission_rate;
          }
        }
      } else if (updateOrganizationDto.parentId === null) {
        organization.parent = null;
        organization.cooperation_type = 'no_commission';
        organization.commission_rate = 0;
      }
      
      // 如果直接更新合作方式为利润分佣，处理佣金比例
      if (updateOrganizationDto.cooperation_type === 'profit_commission') {
        // 确保commission_rate存在且为数字类型
        console.log('处理利润分佣佣金比例:', updateOrganizationDto.commission_rate);
        if (updateOrganizationDto.commission_rate !== undefined) {
          // 确保是数字类型
          organization.commission_rate = Number(updateOrganizationDto.commission_rate);
          console.log('设置佣金比例为:', organization.commission_rate);
        } else if (organization.commission_rate === null || organization.commission_rate === undefined) {
          // 如果未提供且原值不存在，设置默认值为0
          organization.commission_rate = 0;
          console.log('设置默认佣金比例为0');
        }
      } else if (updateOrganizationDto.cooperation_type === 'no_commission' || updateOrganizationDto.cooperation_type === 'normal_trade') {
        // 如果合作方式不是利润分佣，将佣金比例重置为0
        organization.commission_rate = 0;
        console.log('重置佣金比例为0');
      }
      
      const savedOrg = await this.organizationsRepository.save(organization);
      return this.transformToFrontendFormat(savedOrg);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('更新机构失败');
    }
  }

  async remove(id: number): Promise<void> {
    // 总部机构（ID为1）和供应商机构（ID为2）不可删除
    if (id === 1 || id === 2) {
      throw new ConflictException(`ID为${id}的机构不可删除`);
    }
    
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
  private transformToFrontendFormat(org: Organization): any {
    const result = {
      id: org.id,
      name: org.name,
      code: org.code,
      parentId: org.parent?.id,
      parentName: org.parent?.name,
      parent: org.parent ? {
        id: org.parent.id,
        name: org.parent.name,
        type: org.parent.type
      } : null,
      type: org.type,
      status: org.status,
      cooperation_type: org.cooperation_type,
      commission_rate: org.commission_rate || 0, // 确保总是返回commission_rate值
      createdAt: org.created_at,
      updatedAt: org.updated_at
    };
    
    console.log('变换后的机构数据:', result);
    return result;
  }

  async findSuppliers(): Promise<any[]> {
    // 直接使用 find 方法，避免复杂的 QueryBuilder
    const organizations = await this.organizationsRepository.find({
      where: {
        parent: { id: 2 }, // 供应商机构的ID为2
        status: '1', // 只获取启用状态的供应商
      },
      relations: ['parent'],
      order: { sort: 'ASC' },
    });
    
    return organizations.map(org => this.transformToFrontendFormat(org));
  }

  async findSupplierChildren(supplierId: number): Promise<any[]> {
    // 检查供应商ID是否有效
    if (!supplierId || isNaN(supplierId)) {
      return [];
    }

    // 查找指定供应商的子级机构
    const organizations = await this.organizationsRepository.find({
      where: {
        parent: { id: supplierId },
        status: '1', // 只获取启用状态的子级
      },
      relations: ['parent'],
      order: { sort: 'ASC' },
    });
    
    return organizations.map(org => this.transformToFrontendFormat(org));
  }
} 