import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Permission } from '../permissions/entities/permission.entity';
import { Organization } from '../organizations/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, Organization])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {} 