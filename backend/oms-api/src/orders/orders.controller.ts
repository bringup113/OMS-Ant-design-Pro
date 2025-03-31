import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards, Request, ParseIntPipe, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderCommentDto } from './dto/create-order-comment.dto';
import { UpdateBusinessStatusDto } from './dto/update-business-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { GetOrdersDto } from './dto/get-orders.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user);
  }

  @Get()
  async findAll(
    @Req() request: any,
    @Query('current') current?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('count') count?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: string,
    @Query('billId') billId?: string,
  ) {
    console.log('[OrdersController] 获取订单列表, 查询参数:', {
      current, page, pageSize, count, keyword, status, startDate, endDate, customerId, billId
    });
    
    // 构建查询参数，兼容page和current
    const query: GetOrdersDto = {
      current: current ? parseInt(current, 10) : page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : count ? parseInt(count, 10) : undefined,
      keyword,
      status,
      startDate,
      endDate,
      customerId: customerId ? parseInt(customerId, 10) : undefined,
      billId,
    };
    
    // 从请求中获取用户信息
    const user = request.user;
    console.log('查询订单列表的用户信息:', {
      id: user.sub || user.id,
      username: user.username,
      data_scope: user.data_scope,
      organizationId: user.organizationId || user.organization_id
    });
    
    return this.ordersService.findAll(query, user);
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

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: { status: string }
  ) {
    return this.ordersService.updateOrderStatus(id, updateStatusDto.status);
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