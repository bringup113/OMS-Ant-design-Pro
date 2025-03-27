import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProductQuotation } from './entities/product-quotation.entity';
import { CreateProductQuotationDto } from './dto/create-product-quotation.dto';
import { UpdateProductQuotationDto } from './dto/update-product-quotation.dto';
import { QueryProductQuotationDto } from './dto/query-product-quotation.dto';
import { Product } from '../products/entities/product.entity';
import { Organization } from '../organizations/entities/organization.entity';

@Injectable()
export class ProductQuotationsService {
  constructor(
    @InjectRepository(ProductQuotation)
    private readonly productQuotationRepository: Repository<ProductQuotation>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(createProductQuotationDto: CreateProductQuotationDto, userId?: number): Promise<ProductQuotation> {
    console.log('创建报价，用户ID:', userId);
    
    // 检查产品是否存在
    const product = await this.productRepository.findOne({
      where: { id: createProductQuotationDto.productId },
    });
    
    if (!product) {
      throw new NotFoundException(`产品ID ${createProductQuotationDto.productId} 不存在`);
    }
    
    // 检查供应商是否存在
    const supplier = await this.organizationRepository.findOne({
      where: { id: createProductQuotationDto.supplierId },
    });
    
    if (!supplier) {
      throw new NotFoundException(`供应商ID ${createProductQuotationDto.supplierId} 不存在`);
    }
    
    // 检查该产品和供应商组合是否已经存在有效报价
    const existingQuotation = await this.productQuotationRepository.findOne({
      where: {
        productId: createProductQuotationDto.productId,
        supplierId: createProductQuotationDto.supplierId,
        isLatest: true,
        status: 'active',
      },
    });
    
    if (existingQuotation) {
      throw new ConflictException(`产品 ${product.name} 和供应商 ${supplier.name} 的报价已存在，请使用更新功能修改`);
    }
    
    // 把同一产品同一供应商的其他报价设为非最新
    await this.productQuotationRepository.update(
      {
        productId: createProductQuotationDto.productId,
        supplierId: createProductQuotationDto.supplierId,
        isLatest: true,
      },
      { 
        isLatest: false,
        status: 'inactive' // 设置旧报价为已失效
      }
    );
    
    // 创建新的报价记录
    const quotation = this.productQuotationRepository.create({
      productId: createProductQuotationDto.productId,
      supplierId: createProductQuotationDto.supplierId,
      price: createProductQuotationDto.price,
      agentPrice: createProductQuotationDto.agentPrice,
      salePrice: createProductQuotationDto.salePrice,
      status: createProductQuotationDto.status || 'active', // 默认状态为生效中
      remark: createProductQuotationDto.remark,
      isLatest: true,
      createdBy: userId,
    });
    
    return this.productQuotationRepository.save(quotation);
  }

  async findAll(queryDto: QueryProductQuotationDto): Promise<[ProductQuotation[], number]> {
    const { productId, supplierId, status, is_latest, current = 1, pageSize = 10 } = queryDto;
    const skip = (current - 1) * pageSize;
    const take = pageSize;

    const whereConditions: FindOptionsWhere<ProductQuotation> = {};

    if (productId) {
      whereConditions.productId = productId;
    }

    if (supplierId) {
      whereConditions.supplierId = supplierId;
    }

    if (status) {
      whereConditions.status = status;
    }

    if (is_latest !== undefined) {
      whereConditions.isLatest = is_latest;
    }

    const [quotations, total] = await this.productQuotationRepository.findAndCount({
      where: whereConditions,
      relations: ['product', 'supplier', 'createdByUser'],
      skip,
      take,
      order: {
        createdAt: 'DESC',
      },
    });

    return [quotations, total];
  }

  async findOne(id: number): Promise<ProductQuotation> {
    const quotation = await this.productQuotationRepository.findOne({
      where: { id },
      relations: ['product', 'supplier'],
    });

    if (!quotation) {
      throw new NotFoundException(`报价ID ${id} 不存在`);
    }

    return quotation;
  }

  async update(id: number, updateProductQuotationDto: UpdateProductQuotationDto): Promise<ProductQuotation> {
    // 先查询原有的报价
    const quotation = await this.findOne(id);
    
    // 把同一产品同一供应商的其他报价设为非最新且状态为已失效
    await this.productQuotationRepository.update(
      {
        productId: quotation.productId,
        supplierId: quotation.supplierId,
        isLatest: true,
      },
      { 
        isLatest: false,
        status: 'inactive' // 设置旧报价为已失效
      }
    );
    
    // 创建新的报价记录
    const newQuotation = this.productQuotationRepository.create({
      productId: quotation.productId,
      supplierId: quotation.supplierId,
      price: updateProductQuotationDto.price ?? quotation.price,
      agentPrice: updateProductQuotationDto.agentPrice ?? quotation.agentPrice,
      salePrice: updateProductQuotationDto.salePrice ?? quotation.salePrice,
      status: updateProductQuotationDto.status ?? quotation.status,
      remark: updateProductQuotationDto.remark ?? quotation.remark,
      isLatest: true,
      createdBy: quotation.createdBy,
    });
    
    return this.productQuotationRepository.save(newQuotation);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productQuotationRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`报价ID ${id} 不存在`);
    }
  }

  async removeByProductAndSupplier(productId: number, supplierId: number): Promise<void> {
    if (!productId || !supplierId) {
      throw new BadRequestException('产品ID和供应商ID不能为空');
    }

    const result = await this.productQuotationRepository.delete({
      productId,
      supplierId,
    });
    
    if (result.affected === 0) {
      throw new NotFoundException(`未找到产品ID ${productId} 和供应商ID ${supplierId} 的报价记录`);
    }
  }

  async findHistory(productId: number, supplierId: number): Promise<ProductQuotation[]> {
    if (!productId || !supplierId) {
      throw new BadRequestException('产品ID和供应商ID不能为空');
    }

    const quotations = await this.productQuotationRepository.find({
      where: {
        productId,
        supplierId,
      },
      relations: ['product', 'supplier', 'createdByUser'],
      order: {
        createdAt: 'DESC',
      },
    });

    return quotations;
  }
}
