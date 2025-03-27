import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: false }))
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    const result = await this.organizationsService.create(createOrganizationDto);
    return { status: 'ok', data: result };
  }

  @Get()
  async findAll(@Query() query: any) {
    const current = query.current ? parseInt(query.current, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
    
    const { current: _, pageSize: __, ...filters } = query;
    
    const [data, total] = await this.organizationsService.findAll(
      filters,
      current,
      pageSize,
    );
    
    return {
      data,
      total,
      success: true,
    };
  }

  @Get('tree')
  @ApiOperation({ summary: '获取组织机构树状数据' })
  async findAllTree() {
    const [data] = await this.organizationsService.findAll({}, 1, 1000);
    return {
      data,
      success: true,
    };
  }

  @Get('suppliers')
  @ApiOperation({ summary: '获取供应商列表' })
  async getSuppliers() {
    const data = await this.organizationsService.findSuppliers();
    return {
      data,
      success: true,
    };
  }

  @Get('suppliers/:id/children')
  @ApiOperation({ summary: '获取指定供应商的子级列表' })
  async getSupplierChildren(@Param('id') id: string) {
    const data = await this.organizationsService.findSupplierChildren(+id);
    return {
      data,
      success: true,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.organizationsService.findOne(+id);
    return { data: result };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: false }))
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    const result = await this.organizationsService.update(+id, updateOrganizationDto);
    return { status: 'ok', data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.organizationsService.remove(+id);
    return { status: 'ok' };
  }
} 