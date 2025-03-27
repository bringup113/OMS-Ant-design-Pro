import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// 注释掉缺失的权限守卫和装饰器，暂时不使用权限控制
// import { PermissionsGuard } from '../auth/guards/permissions.guard';
// import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { BillStyleService } from './bill-style.service';
import { CreateBillStyleTemplateDto } from './dto/create-bill-style-template.dto';
import { UpdateBillStyleTemplateDto } from './dto/update-bill-style-template.dto';
import { Request } from 'express';

@ApiTags('账单样式')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // 暂时移除PermissionsGuard
@Controller('bill-style')
export class BillStyleController {
  constructor(private readonly billStyleService: BillStyleService) {}

  @Get()
  @ApiOperation({ summary: '获取所有账单样式模板' })
  @ApiResponse({ status: 200, description: '成功获取账单样式模板列表' })
  // @RequirePermissions('bill-style:query')
  findAll() {
    return this.billStyleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定账单样式模板详情' })
  @ApiResponse({ status: 200, description: '成功获取账单样式模板详情' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  // @RequirePermissions('bill-style:query')
  findOne(@Param('id') id: string) {
    return this.billStyleService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: '创建新的账单样式模板' })
  @ApiResponse({ status: 201, description: '成功创建账单样式模板' })
  // @RequirePermissions('bill-style:edit')
  create(@Body() createDto: CreateBillStyleTemplateDto, @Req() req: Request) {
    const userId = req.user?.['userId'] || null;
    return this.billStyleService.create(createDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新账单样式模板' })
  @ApiResponse({ status: 200, description: '成功更新账单样式模板' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  // @RequirePermissions('bill-style:edit')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBillStyleTemplateDto,
    @Req() req: Request
  ) {
    const userId = req.user?.['userId'] || null;
    return this.billStyleService.update(+id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除账单样式模板' })
  @ApiResponse({ status: 204, description: '成功删除账单样式模板' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  @ApiResponse({ status: 409, description: '不能删除默认模板' })
  @HttpCode(HttpStatus.NO_CONTENT)
  // @RequirePermissions('bill-style:edit')
  remove(@Param('id') id: string) {
    return this.billStyleService.remove(+id);
  }

  @Post(':id/default')
  @ApiOperation({ summary: '设置默认账单样式模板' })
  @ApiResponse({ status: 200, description: '成功设置默认账单样式模板' })
  @ApiResponse({ status: 404, description: '模板不存在' })
  // @RequirePermissions('bill-style:edit')
  setDefault(@Param('id') id: string) {
    return this.billStyleService.setDefault(+id);
  }
} 