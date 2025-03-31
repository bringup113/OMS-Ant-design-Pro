import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

@ApiTags('权限管理')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有权限列表' })
  async findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll();
  }
} 