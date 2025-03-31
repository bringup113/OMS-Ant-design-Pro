import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../users/entities/user.entity';
import { DataPermissionsService } from '../permissions/data-permissions.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataPermissionsService: DataPermissionsService,
  ) {}

  async create(createProductDto: CreateProductDto, currentUser: User) {
    // 创建产品
    const product = this.productRepository.create({
      ...createProductDto,
      createdBy: currentUser?.id || 1, // 如果currentUser为undefined，使用默认用户ID 1
    });

    // 保存产品
    const savedProduct = await this.productRepository.save(product);

    // 返回创建的产品
    return this.findOne(savedProduct.id, currentUser);
  }

  async findAll(
    query: {
      current?: number;
      pageSize?: number;
      name?: string;
      status?: string;
      category?: string;
      country?: string;
    },
    currentUser: User,
  ) {
    const { current = 1, pageSize = 10, name, status, category, country } = query;
    const skip = (current - 1) * pageSize;

    // 创建查询构建器
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .skip(skip)
      .take(pageSize)
      .orderBy('product.id', 'DESC');

    // 添加过滤条件
    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    // 添加国家过滤
    if (country) {
      queryBuilder.andWhere('product.country = :country', { country });
    }

    // 添加产品类别过滤
    if (category) {
      queryBuilder.andWhere('category.name LIKE :category', { category: `%${category}%` });
    }

    // 注意：对于产品查询，我们不应用数据范围权限过滤
    // 所有用户都可以看到所有产品，不考虑用户的data_scope设置

    // 执行查询
    const [products, total] = await queryBuilder.getManyAndCount();

    // 转换为前端需要的格式
    const data = products.map(product => ({
      id: product.id,
      name: product.name,
      category: {
        id: product.category?.id,
        name: product.category?.name,
      },
      categoryId: product.categoryId,
      description: product.description,
      country: product.country as string,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return {
      data,
      total,
      success: true,
      current,
      pageSize,
    };
  }

  async findOne(id: number, currentUser: User) {
    // 创建查询构建器
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id });

    // 执行查询
    const product = await queryBuilder.getOne();

    if (!product) {
      throw new NotFoundException(`产品不存在`);
    }

    // 转换为前端需要的格式
    return {
      id: product.id,
      name: product.name,
      category: {
        id: product.category?.id,
        name: product.category?.name,
      },
      categoryId: product.categoryId,
      description: product.description,
      country: product.country as string,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto, currentUser: User) {
    // 查找产品
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`产品不存在`);
    }

    // 更新产品
    Object.assign(product, updateProductDto);

    // 保存更新后的产品
    const savedProduct = await this.productRepository.save(product);

    // 返回更新后的产品
    return this.findOne(savedProduct.id, currentUser);
  }

  async remove(id: number, currentUser: User) {
    // 查找产品
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`产品不存在`);
    }

    // 删除产品
    await this.productRepository.remove(product);

    return { success: true };
  }
} 