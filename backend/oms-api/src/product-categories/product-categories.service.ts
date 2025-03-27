import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
  ) {}

  async create(createProductCategoryDto: CreateProductCategoryDto): Promise<ProductCategory> {
    const productCategory = this.productCategoryRepository.create(createProductCategoryDto);
    
    // 先保存以获取ID
    const savedCategory = await this.productCategoryRepository.save(productCategory);
    
    // 始终使用ID作为排序值
    savedCategory.sort = savedCategory.id;
    return this.productCategoryRepository.save(savedCategory);
  }

  async findAll(params: any = {}): Promise<{ data: ProductCategory[]; total: number }> {
    const { current = 1, pageSize = 20, sorter = {}, filter = {} } = params;
    
    // 创建一个基础查询构建器，不包含过滤条件
    const baseQueryBuilder = this.productCategoryRepository.createQueryBuilder('category')
      .orderBy('category.sort', 'ASC');
    
    // 创建一个带过滤条件的查询构建器
    const filteredQueryBuilder = this.productCategoryRepository.createQueryBuilder('category')
      .orderBy('category.sort', 'ASC');
    
    // 添加排序
    if (sorter.field && sorter.order) {
      const order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      baseQueryBuilder.orderBy(`category.${sorter.field}`, order);
      filteredQueryBuilder.orderBy(`category.${sorter.field}`, order);
    }
    
    // 添加过滤条件到过滤查询构建器
    let hasFilters = false;
    
    if (params.name) {
      filteredQueryBuilder.andWhere('LOWER(category.name) LIKE LOWER(:name)', { name: `%${params.name}%` });
      hasFilters = true;
    }
    
    if (params.code) {
      filteredQueryBuilder.andWhere('LOWER(category.code) LIKE LOWER(:code)', { code: `%${params.code}%` });
      hasFilters = true;
    }
    
    // 特殊处理状态筛选
    if (params.status !== undefined && params.status !== null && params.status !== '') {
      filteredQueryBuilder.andWhere('category.status = :status', { status: params.status });
      hasFilters = true;
    }
    
    // 如果有过滤条件，则需要特殊处理
    if (hasFilters) {
      // 获取满足过滤条件的类别
      const filteredCategories = await filteredQueryBuilder.getMany();
      
      if (filteredCategories.length === 0) {
        return { data: [], total: 0 };
      }
      
      // 获取所有满足条件的类别ID
      const filteredIds = filteredCategories.map(category => category.id);
      
      // 获取所有类别
      const allCategories = await baseQueryBuilder.getMany();
      
      // 标记满足条件的类别
      const markedCategories = allCategories.map(category => ({
        ...category,
        isFiltered: filteredIds.includes(category.id),
      }));
      
      // 构建树形结构，保留满足条件的节点及其父节点
      const treeData = this.buildFilteredTree(markedCategories);
      
      return { data: treeData, total: filteredCategories.length };
    }
    
    // 如果没有过滤条件，则直接分页查询
    const skip = (current - 1) * pageSize;
    const [data, total] = await Promise.all([
      baseQueryBuilder.skip(skip).take(pageSize).getMany(),
      baseQueryBuilder.getCount(),
    ]);
    
    return { data, total };
  }

  async findAllTree(): Promise<ProductCategory[]> {
    // 查询所有类别
    const queryBuilder = this.productCategoryRepository.createQueryBuilder('category')
      .orderBy('category.sort', 'ASC');
    
    const allCategories = await queryBuilder.getMany();
    
    // 构建树形结构
    return this.buildTree(allCategories);
  }

  async findOne(id: number): Promise<ProductCategory> {
    const category = await this.productCategoryRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    
    if (!category) {
      throw new NotFoundException(`产品类别 #${id} 不存在`);
    }
    
    return category;
  }

  async update(id: number, updateProductCategoryDto: UpdateProductCategoryDto): Promise<ProductCategory> {
    const category = await this.findOne(id);
    
    // 创建一个新的DTO对象，排除sort字段
    const updateData = { ...updateProductCategoryDto };
    delete updateData.sort; // 确保不会修改排序值
    
    await this.productCategoryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    
    // 检查是否有子类别
    const hasChildren = await this.productCategoryRepository.findOne({
      where: { parentId: id },
    });
    
    if (hasChildren) {
      throw new Error('该类别下有子类别，无法删除');
    }
    
    await this.productCategoryRepository.remove(category);
  }

  async findEnabled(): Promise<ProductCategory[]> {
    // 查询启用的类别
    const queryBuilder = this.productCategoryRepository.createQueryBuilder('category')
      .where('category.status = :status', { status: 'enabled' })
      .orderBy('category.sort', 'ASC');
    
    const enabledCategories = await queryBuilder.getMany();
    
    // 构建树形结构
    return this.buildTree(enabledCategories);
  }

  /**
   * 获取启用的产品类别树，返回前端TreeSelect组件所需的数据格式
   */
  async findEnabledForTreeSelect(): Promise<any[]> {
    // 查询启用的类别
    const queryBuilder = this.productCategoryRepository.createQueryBuilder('category')
      .where('category.status = :status', { status: 'enabled' })
      .orderBy('category.sort', 'ASC');
    
    const enabledCategories = await queryBuilder.getMany();
    
    // 构建树形结构，并转换为TreeSelect所需的格式
    return this.buildTreeForTreeSelect(enabledCategories);
  }

  /**
   * 构建TreeSelect组件所需的树形结构
   */
  private buildTreeForTreeSelect(categories: ProductCategory[], parentId: number | null = null): any[] {
    const result: any[] = [];
    
    for (const category of categories) {
      if ((parentId === null && !category.parentId) || category.parentId === parentId) {
        const children = this.buildTreeForTreeSelect(categories, category.id);
        
        const treeNode = {
          label: category.name,
          value: category.id,
          children: children.length > 0 ? children : undefined,
        };
        
        result.push(treeNode);
      }
    }
    
    return result;
  }

  private buildTree(categories: ProductCategory[], parentId: number | null = null): ProductCategory[] {
    const result: ProductCategory[] = [];
    
    for (const category of categories) {
      if ((parentId === null && !category.parentId) || category.parentId === parentId) {
        const children = this.buildTree(categories, category.id);
        
        if (children.length > 0) {
          category.children = children;
        }
        
        result.push(category);
      }
    }
    
    return result;
  }

  // 构建过滤后的树形结构，保留满足条件的节点及其父节点
  private buildFilteredTree(categories: (ProductCategory & { isFiltered?: boolean })[], parentId: number | null = null): ProductCategory[] {
    const result: ProductCategory[] = [];
    
    for (const category of categories) {
      if ((parentId === null && !category.parentId) || category.parentId === parentId) {
        const children = this.buildFilteredTree(categories, category.id);
        
        // 如果当前节点满足条件或者有满足条件的子节点，则保留
        if (category.isFiltered || children.length > 0) {
          const newCategory = { ...category };
          delete newCategory.isFiltered; // 删除临时标记
          
          if (children.length > 0) {
            newCategory.children = children;
          }
          
          result.push(newCategory);
        }
      }
    }
    
    return result;
  }
} 