import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductQuotationsService } from './product-quotations.service';
import { CreateProductQuotationDto } from './dto/create-product-quotation.dto';
import { UpdateProductQuotationDto } from './dto/update-product-quotation.dto';
import { QueryProductQuotationDto } from './dto/query-product-quotation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('product-quotations')
@Controller('product/quotations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductQuotationsController {
  constructor(private readonly productQuotationsService: ProductQuotationsService) {}

  @Post()
  @ApiOperation({ summary: '创建报价' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createProductQuotationDto: CreateProductQuotationDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    const quotation = await this.productQuotationsService.create(createProductQuotationDto, userId);
    return {
      data: quotation,
      success: true,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取报价列表' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() queryDto: QueryProductQuotationDto) {
    const [data, total] = await this.productQuotationsService.findAll(queryDto);
    return { data, total, success: true };
  }

  @Get('history')
  @ApiOperation({ summary: '获取报价历史记录' })
  async findHistory(@Query('productId') productId: number, @Query('supplierId') supplierId: number) {
    const data = await this.productQuotationsService.findHistory(+productId, +supplierId);
    return { data, success: true };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个报价' })
  async findOne(@Param('id') id: string) {
    const data = await this.productQuotationsService.findOne(+id);
    return { data, success: true };
  }

  @Post(':id/update')
  @ApiOperation({ summary: '更新报价（创建新记录）' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateProductQuotationDto: UpdateProductQuotationDto) {
    const data = await this.productQuotationsService.update(+id, updateProductQuotationDto);
    return { data, success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除报价' })
  async remove(@Param('id') id: string) {
    await this.productQuotationsService.remove(+id);
    return { success: true };
  }

  @Delete('product/:productId/supplier/:supplierId')
  @ApiOperation({ summary: '删除指定产品和供应商的所有报价' })
  async removeByProductAndSupplier(
    @Param('productId') productId: string,
    @Param('supplierId') supplierId: string,
  ) {
    await this.productQuotationsService.removeByProductAndSupplier(+productId, +supplierId);
    return { success: true };
  }
}
