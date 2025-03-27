import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Visa } from './entities/visa.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateVisaDto } from './dto/create-visa.dto';
import { UpdateVisaDto } from './dto/update-visa.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Visa)
    private visasRepository: Repository<Visa>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async findAll(query: any): Promise<{ data: Customer[]; total: number }> {
    const take = query.pageSize || 10;
    const skip = ((query.current || 1) - 1) * take;
    
    const queryBuilder = this.customersRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.visas', 'visa')
      .select([
        'customer.id',
        'customer.name',
        'customer.passportNo',
        'customer.gender',
        'customer.country',
        'customer.birthDate',
        'customer.issueDate',
        'customer.expiryDate',
        'customer.createdAt',
        'customer.updatedAt',
      ])
      .addSelect('COUNT(visa.id)', 'visaCount')
      .groupBy('customer.id')
      .orderBy('customer.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    
    // 添加过滤条件
    if (query.name) {
      queryBuilder.andWhere('customer.name LIKE :name', { name: `%${query.name}%` });
    }
    
    if (query.passportNo) {
      queryBuilder.andWhere('customer.passportNo LIKE :passportNo', { passportNo: `%${query.passportNo}%` });
    }
    
    if (query.country) {
      queryBuilder.andWhere('customer.country = :country', { country: query.country });
    }
    
    const [customers, total] = await queryBuilder.getManyAndCount();
    
    // 处理签证数量
    const customersWithVisaCount = await Promise.all(
      customers.map(async (customer) => {
        const visaCount = await this.visasRepository.count({ where: { customerId: customer.id } });
        return {
          ...customer,
          visaCount,
        };
      }),
    );
    
    return {
      data: customersWithVisaCount,
      total,
    };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    this.customersRepository.merge(customer, updateCustomerDto);
    return this.customersRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }

  // 签证相关方法
  async findCustomerVisas(customerId: number): Promise<Visa[]> {
    const customer = await this.findOne(customerId);
    return this.visasRepository.find({
      where: { customerId: customer.id },
      order: { createdAt: 'DESC' },
    });
  }

  async createVisa(createVisaDto: CreateVisaDto): Promise<Visa> {
    const customer = await this.findOne(createVisaDto.customerId);
    const visa = this.visasRepository.create(createVisaDto);
    return this.visasRepository.save(visa);
  }

  async batchCreateVisas(customerId: number, visas: Omit<CreateVisaDto, 'customerId'>[]): Promise<Visa[]> {
    try {
      console.log('服务层 - 准备批量创建签证');
      console.log(`服务层 - 客户ID: ${customerId}, 签证条数: ${visas.length}`);
      console.log('服务层 - 接收到的签证数据:', JSON.stringify(visas, null, 2));
      
      const customer = await this.findOne(customerId);
      console.log(`服务层 - 找到客户: ${customer.name}`);
      
      const visaEntities = visas.map(visa => 
        this.visasRepository.create({
          ...visa,
          customerId,
        })
      );
      
      console.log('服务层 - 创建的签证实体:');
      visaEntities.forEach((visa, index) => {
        console.log(`服务层 - 签证 ${index + 1}:`, JSON.stringify({
          country: visa.country,
          visaName: visa.visaName,
          issueDate: visa.issueDate,
          expiryDate: visa.expiryDate,
          customerId: visa.customerId,
        }, null, 2));
      });
      
      const savedVisas = await this.visasRepository.save(visaEntities);
      
      console.log(`服务层 - 成功保存 ${savedVisas.length} 条签证数据`);
      console.log('服务层 - 保存的签证ID:', savedVisas.map(v => v.id).join(', '));
      
      return savedVisas;
    } catch (error) {
      console.error('服务层 - 批量创建签证错误:', error);
      throw error;
    }
  }

  async findVisa(id: number): Promise<Visa> {
    const visa = await this.visasRepository.findOne({ where: { id } });
    if (!visa) {
      throw new NotFoundException(`Visa with ID ${id} not found`);
    }
    return visa;
  }

  async updateVisa(id: number, updateVisaDto: UpdateVisaDto): Promise<Visa> {
    const visa = await this.findVisa(id);
    this.visasRepository.merge(visa, updateVisaDto);
    return this.visasRepository.save(visa);
  }

  async removeVisa(id: number): Promise<void> {
    const visa = await this.findVisa(id);
    await this.visasRepository.remove(visa);
  }
} 