import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductCountryService } from './product-country.service';
import { CreateProductCountryDto } from './dto/create-product-country.dto';
import { UpdateProductCountryDto } from './dto/update-product-country.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('国家管理')
@Controller('countries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProductCountryController {
  constructor(private readonly productCountryService: ProductCountryService) {}

  @Get()
  @ApiOperation({ summary: '获取国家列表' })
  async findAll(@Query() query: any) {
    const result = await this.productCountryService.findAll(query);
    return {
      data: result.data,
      success: true,
      total: result.total
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个国家详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productCountryService.findOne(id);
    return {
      data,
      success: true
    };
  }

  @Post()
  @ApiOperation({ summary: '创建国家' })
  async create(@Body() createProductCountryDto: CreateProductCountryDto) {
    const data = await this.productCountryService.create(createProductCountryDto);
    return {
      data,
      success: true
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新国家' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductCountryDto: UpdateProductCountryDto,
  ) {
    console.log('接收到的更新数据:', id, updateProductCountryDto);
    const data = await this.productCountryService.update(id, updateProductCountryDto);
    return {
      data,
      success: true
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除国家' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productCountryService.remove(id);
    return {
      success: true
    };
  }

  @Delete()
  @ApiOperation({ summary: '批量删除国家' })
  async batchRemove(@Body() body: { key: string[] }) {
    await this.productCountryService.batchRemove(body.key);
    return {
      success: true
    };
  }
} 