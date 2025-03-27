import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('产品管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product/items')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: User) {
    const data = await this.productsService.create(createProductDto, user);
    return {
      data,
      success: true
    };
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name: string,
    @Query('status') status: string,
    @Query('category') category: string,
    @Query('country') country: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.productsService.findAll(
      {
        current: current ? +current : undefined,
        pageSize: pageSize ? +pageSize : undefined,
        name,
        status,
        category,
        country,
      } as any,
      user,
    );
    
    return {
      data: result.data,
      success: true,
      total: result.total
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const data = await this.productsService.findOne(+id, user);
    return {
      data,
      success: true
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新产品' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.productsService.update(+id, updateProductDto, user);
    return {
      data,
      success: true
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除产品' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.productsService.remove(+id, user);
    return {
      success: true
    };
  }
} 