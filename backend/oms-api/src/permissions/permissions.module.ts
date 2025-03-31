import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionAuditLog } from './entities/permission-audit-log.entity';
import { DataPermission } from './entities/data-permission.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthModule } from '../auth/auth.module';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionsAuditService } from './permissions-audit.service';
import { DataPermissionsService } from './data-permissions.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, PermissionAuditLog, DataPermission, User]),
    AuthModule
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService, 
    PermissionsGuard, 
    PermissionsAuditService,
    DataPermissionsService
  ],
  exports: [
    TypeOrmModule, 
    PermissionsGuard, 
    PermissionsService, 
    PermissionsAuditService,
    DataPermissionsService
  ],
})
export class PermissionsModule {} 