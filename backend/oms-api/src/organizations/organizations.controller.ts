import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Controller('organizations')
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
      undefined,
      undefined,
    );
    
    return {
      data,
      total,
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