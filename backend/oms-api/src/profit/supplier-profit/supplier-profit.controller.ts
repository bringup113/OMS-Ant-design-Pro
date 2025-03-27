import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SupplierProfitService } from './supplier-profit.service';
import { GetSupplierProfitDto, UpdateSettlementStatusDto } from './dto/supplier-profit.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../permissions/guards/permissions.guard';
import { RequirePermission, PermissionBit } from '../../permissions/decorators/permissions.decorator';

@Controller('profit/supplier')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SupplierProfitController {
  constructor(private readonly supplierProfitService: SupplierProfitService) {}

  @Get()
  @RequirePermission(PermissionBit.VIEW)
  async findAll(@Query() query: GetSupplierProfitDto) {
    return this.supplierProfitService.findAll(query);
  }

  @Post('settlement-status')
  @RequirePermission(PermissionBit.EDIT)
  async updateSettlementStatus(@Body() updateDto: UpdateSettlementStatusDto) {
    return this.supplierProfitService.updateSettlementStatus(updateDto);
  }
} 