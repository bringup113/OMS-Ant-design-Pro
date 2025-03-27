import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AgentProfitService } from '../agent-profit/agent-profit.service';
import { GetAgentProfitDto, UpdateSettlementStatusDto } from './dto/agent-profit.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../permissions/guards/permissions.guard';
import { RequirePermission, PermissionBit } from '../../permissions/decorators/permissions.decorator';

@Controller('profit/agent')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AgentProfitController {
  constructor(private readonly agentProfitService: AgentProfitService) {}

  @Get()
  @RequirePermission(PermissionBit.VIEW)
  async findAll(@Query() query: GetAgentProfitDto) {
    return this.agentProfitService.findAll(query);
  }

  @Post('settlement-status')
  @RequirePermission(PermissionBit.EDIT)
  async updateSettlementStatus(@Body() updateDto: UpdateSettlementStatusDto) {
    return this.agentProfitService.updateSettlementStatus(updateDto);
  }
} 