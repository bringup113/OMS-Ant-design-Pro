import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: false }))
  async create(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.rolesService.create(createRoleDto);
    return { status: 'ok', data: result };
  }

  @Get()
  async findAll(@Query() query: any) {
    const current = query.current ? parseInt(query.current, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10;
    
    const { current: _, pageSize: __, ...filters } = query;
    
    const [data, total] = await this.rolesService.findAll(
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.rolesService.findOne(+id);
    return { data: result };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: false }))
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const result = await this.rolesService.update(+id, updateRoleDto);
    return { status: 'ok', data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
    return { status: 'ok' };
  }
} 