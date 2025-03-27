import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderCommentDto } from './dto/create-order-comment.dto';
import { UpdateBusinessStatusDto } from './dto/update-business-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user);
  }

  @Get()
  async findAll(@Query() query) {
    const { page = 1, limit = 10, ...filters } = query;
    return this.ordersService.findAll(+page, +limit, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Patch(':orderId/businesses/:businessId/status')
  async updateBusinessStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() updateBusinessStatusDto: UpdateBusinessStatusDto
  ) {
    return this.ordersService.updateOrderBusinessStatus(orderId, businessId, updateBusinessStatusDto.status);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: '创建订单评论' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ type: CreateOrderCommentDto })
  @ApiResponse({ status: 201, description: '评论创建成功' })
  createComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateOrderCommentDto,
    @Request() req: any,
  ) {
    return this.ordersService.createComment(id, createCommentDto, req.user);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: '获取订单评论列表' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '评论列表获取成功' })
  getComments(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.getComments(id);
  }
} 