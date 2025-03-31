import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPermissionsService } from './data-permissions.service';
import { DataPermission } from './entities/data-permission.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataPermission, User]),
  ],
  providers: [DataPermissionsService],
  exports: [DataPermissionsService],
})
export class DataPermissionsModule {} 