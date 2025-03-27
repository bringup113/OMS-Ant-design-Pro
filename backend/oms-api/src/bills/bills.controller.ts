import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('账单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: '创建账单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  create(@Body() createBillDto: CreateBillDto, @Req() req) {
    // 从JWT获取当前用户ID
    const userId = req.user.id;
    console.log('创建账单，用户信息:', req.user);
    return this.billsService.create(createBillDto, userId);
  }

  @Get()
  @ApiOperation({ summary: '获取所有账单' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll() {
    return this.billsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个账单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '账单不存在' })
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新账单' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '账单不存在' })
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billsService.update(+id, updateBillDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除账单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '账单不存在' })
  remove(@Param('id') id: string) {
    return this.billsService.remove(+id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: '获取账单关联的订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '账单不存在' })
  getOrders(@Param('id') id: string) {
    return this.billsService.getOrdersByBillId(+id);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: '获取账单的付款记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '账单不存在' })
  getBillPayments(@Param('id') id: string) {
    return this.billsService.getBillPaymentRecords(+id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: '添加账单付款记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  @ApiResponse({ status: 404, description: '账单不存在' })
  addPayment(
    @Param('id') id: string,
    @Body() createPaymentRecordDto: CreatePaymentRecordDto,
    @Req() req
  ) {
    const userId = req.user.id;
    console.log('添加付款记录，用户信息:', req.user);
    return this.billsService.addPaymentRecord(+id, createPaymentRecordDto, userId);
  }
  
  @Delete('payments/:id')
  @ApiOperation({ summary: '删除付款记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '付款记录不存在' })
  removePayment(@Param('id') id: string) {
    return this.billsService.removePaymentRecord(+id);
  }
} 