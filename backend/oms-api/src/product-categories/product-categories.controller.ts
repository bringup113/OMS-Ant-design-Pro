import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('产品类别')
@Controller('product/categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProductCategoriesController {
  constructor(private readonly productCategoriesService: ProductCategoriesService) {}

  @Get('tree')
  @ApiOperation({ summary: '获取完整的产品类别树' })
  async findAllTree() {
    const data = await this.productCategoriesService.findAllTree();
    return {
      data,
      success: true,
      total: data.length
    };
  }

  @Get('enabled')
  @ApiOperation({ summary: '获取启用的产品类别树' })
  async findEnabled() {
    const data = await this.productCategoriesService.findEnabled();
    return {
      data,
      success: true,
      total: data.length
    };
  }

  @Get('enabled-tree-select')
  @ApiOperation({ summary: '获取启用的产品类别树（TreeSelect格式）' })
  async findEnabledForTreeSelect() {
    const data = await this.productCategoriesService.findEnabledForTreeSelect();
    return {
      data,
      success: true,
      total: data.length
    };
  }

  @Get()
  @ApiOperation({ summary: '获取产品类别列表（分页）' })
  async findAll(@Query() query: any) {
    const result = await this.productCategoriesService.findAll(query);
    return {
      data: result.data,
      success: true,
      total: result.total
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个产品类别' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productCategoriesService.findOne(id);
    return {
      data,
      success: true
    };
  }

  @Post()
  @ApiOperation({ summary: '创建产品类别' })
  async create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    const data = await this.productCategoriesService.create(createProductCategoryDto);
    return {
      data,
      success: true
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新产品类别' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    const data = await this.productCategoriesService.update(id, updateProductCategoryDto);
    return {
      data,
      success: true
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除产品类别' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productCategoriesService.remove(id);
    return {
      success: true
    };
  }
} 