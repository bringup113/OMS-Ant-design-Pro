import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request } from 'express';

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

  @Patch(':id/permissions')
  async updatePermissions(
    @Param('id') id: string, 
    @Body() body: { permissions: string[] },
    @Req() req: Request
  ) {
    console.log('收到更新角色权限请求:', id, '权限数量:', body.permissions?.length);
    console.log('权限代码列表:', JSON.stringify(body.permissions));
    
    // 从权限代码转换为权限ID
    try {
      const permissionCodes = body.permissions || [];
      const permissions = await this.rolesService.getPermissionIdsByCodes(permissionCodes);
      
      if (permissions.length === 0) {
        console.warn('未找到任何有效权限，可能是权限代码不存在');
      }
      
      const permissionIds = permissions.map(p => p.id);
      
      console.log('转换后的权限IDs:', permissionIds);
      
      // 调用service方法更新权限并记录审计日志
      const updatedRole = await this.rolesService.updateRolePermissions(+id, permissionIds, req);
      
      // 清除所有受影响用户的权限缓存
      await this.rolesService.clearCacheForUsersWithRole(+id);
      
      // 获取完整的角色数据（包括转换格式）以返回给前端
      const roleData = await this.rolesService.findOne(+id);
      
      return { 
        status: 'ok', 
        message: '权限更新成功',
        data: roleData
      };
    } catch (error) {
      console.error('更新角色权限失败:', error);
      const errorMessage = error.message || '未知错误';
      console.error('错误详情:', errorMessage);
      
      // 重新抛出错误以便全局错误处理器捕获
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
    return { status: 'ok' };
  }
} 