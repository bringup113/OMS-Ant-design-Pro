import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductCountry } from './entities/product-country.entity';
import { CreateProductCountryDto } from './dto/create-product-country.dto';
import { UpdateProductCountryDto } from './dto/update-product-country.dto';

@Injectable()
export class ProductCountryService {
  constructor(
    @InjectRepository(ProductCountry)
    private productCountryRepository: Repository<ProductCountry>,
  ) {}

  async create(createProductCountryDto: CreateProductCountryDto): Promise<ProductCountry> {
    const productCountry = this.productCountryRepository.create(createProductCountryDto);
    
    // 先保存以获取ID
    const savedCountry = await this.productCountryRepository.save(productCountry);
    
    // 使用ID作为排序值
    savedCountry.sort = savedCountry.id;
    return this.productCountryRepository.save(savedCountry);
  }

  async findAll(params: any = {}): Promise<{ data: ProductCountry[]; total: number }> {
    const { current = 1, pageSize = 20, sorter = {}, filter = {}, ...rest } = params;
    
    // 创建查询构建器
    const queryBuilder = this.productCountryRepository.createQueryBuilder('country')
      .orderBy('country.sort', 'ASC');
    
    // 添加排序
    if (sorter.field && sorter.order) {
      const order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`country.${sorter.field}`, order);
    }
    
    // 添加过滤条件
    if (rest.name) {
      queryBuilder.andWhere('country.name LIKE :name', { name: `%${rest.name}%` });
    }
    
    if (rest.englishName) {
      queryBuilder.andWhere('LOWER(country.englishName) LIKE LOWER(:englishName)', { englishName: `%${rest.englishName}%` });
    }
    
    if (rest.status) {
      queryBuilder.andWhere('country.status = :status', { status: rest.status });
    }
    
    // 获取总数
    const total = await queryBuilder.getCount();
    
    // 添加分页
    queryBuilder
      .skip((current - 1) * pageSize)
      .take(pageSize);
    
    // 执行查询
    const data = await queryBuilder.getMany();
    
    return { data, total };
  }

  async findOne(id: number): Promise<ProductCountry> {
    const country = await this.productCountryRepository.findOne({ where: { id } });
    if (!country) {
      throw new NotFoundException(`国家ID ${id} 不存在`);
    }
    return country;
  }

  async update(id: number, updateProductCountryDto: UpdateProductCountryDto): Promise<ProductCountry> {
    const country = await this.findOne(id);
    
    // 合并更新数据，但保留原始的sort值
    const updatedCountry = {
      ...country,
      ...updateProductCountryDto,
      sort: country.sort, // 确保保留原始的sort值
    };
    
    return this.productCountryRepository.save(updatedCountry);
  }

  async remove(id: number): Promise<void> {
    const country = await this.findOne(id);
    await this.productCountryRepository.remove(country);
  }

  async batchRemove(ids: string[]): Promise<void> {
    const numericIds = ids.map(id => parseInt(id, 10));
    const countries = await this.productCountryRepository.find({
      where: { id: In(numericIds) }
    });
    
    if (countries.length > 0) {
      await this.productCountryRepository.remove(countries);
    }
  }
} 