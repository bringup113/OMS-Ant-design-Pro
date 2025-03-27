import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateVisaDto } from './dto/create-visa.dto';
import { UpdateVisaDto } from './dto/update-visa.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);
    return {
      success: true,
      data: customer,
    };
  }

  @Get()
  async findAll(@Query() query: any) {
    const { data, total } = await this.customersService.findAll(query);
    return {
      success: true,
      data,
      total,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const customer = await this.customersService.findOne(+id);
    return {
      success: true,
      data: customer,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customersService.update(+id, updateCustomerDto);
    return {
      success: true,
      data: customer,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.customersService.remove(+id);
  }

  // 签证相关接口
  @Get(':id/visas')
  async findCustomerVisas(@Param('id') id: string) {
    const visas = await this.customersService.findCustomerVisas(+id);
    return {
      success: true,
      data: visas,
    };
  }

  @Post(':id/visas/batch')
  async batchCreateVisas(
    @Param('id') id: string,
    @Body() visas: Omit<CreateVisaDto, 'customerId'>[],
  ) {
    console.log(`======== 批量创建签证开始 ========`);
    console.log(`客户ID: ${id}, 签证数量: ${visas.length}`);
    console.log('签证数据详情:');
    console.log(JSON.stringify(visas, null, 2));
    
    try {
      // 确认客户存在
      const customer = await this.customersService.findOne(+id);
      console.log(`找到客户: ${customer.name}, ID: ${customer.id}`);
      
      const createdVisas = await this.customersService.batchCreateVisas(+id, visas);
      console.log(`成功创建 ${createdVisas.length} 条签证记录`);
      console.log(`创建的签证ID: ${createdVisas.map(v => v.id).join(', ')}`);
      console.log(`======== 批量创建签证结束 ========`);
      
      return {
        success: true,
        data: createdVisas,
      };
    } catch (error) {
      console.error('批量创建签证失败:', error);
      console.log(`======== 批量创建签证失败 ========`);
      throw error;
    }
  }
}

@Controller('visas')
export class VisasController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createVisaDto: CreateVisaDto) {
    const visa = await this.customersService.createVisa(createVisaDto);
    return {
      success: true,
      data: visa,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVisaDto: UpdateVisaDto) {
    const visa = await this.customersService.updateVisa(+id, updateVisaDto);
    return {
      success: true,
      data: visa,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.customersService.removeVisa(+id);
  }
} 