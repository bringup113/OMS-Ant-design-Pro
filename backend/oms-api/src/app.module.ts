import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductsModule } from './products/products.module';
import { ProductCountryModule } from './product-country/product-country.module';
import { ProductQuotationsModule } from './product-quotations/product-quotations.module';
import { CustomersModule } from './customers/customers.module';
import { AgentsModule } from './agents/agents.module';
import { OrdersModule } from './orders/orders.module';
import { BillStyleModule } from './bill-style/bill-style.module';
import { BillsModule } from './bills/bills.module';
import { ProfitModule } from './profit/profit.module';
import { CacheModule } from '@nestjs/cache-manager';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 默认使用内存缓存
        const config: any = {
          ttl: 1800, // 30分钟
        };

        // 如果配置了Redis，则使用Redis缓存
        const redisHost = configService.get('REDIS_HOST');
        const redisPort = configService.get('REDIS_PORT');
        
        if (redisHost && redisPort) {
          try {
            // 动态导入redisStore
            const redisStore = require('cache-manager-redis-store');
            config.store = redisStore;
            config.host = redisHost;
            config.port = redisPort;
            console.log('使用Redis缓存，配置:', redisHost, redisPort);
          } catch (error) {
            console.log('Redis连接失败，回退到内存缓存:', error);
          }
        } else {
          console.log('未配置Redis，使用内存缓存');
        }
        
        return config;
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        migrationsRun: false,
      }),
    }),
    UsersModule,
    AuthModule,
    OrganizationsModule,
    RolesModule,
    PermissionsModule,
    ProductCategoriesModule,
    ProductsModule,
    ProductCountryModule,
    ProductQuotationsModule,
    CustomersModule,
    AgentsModule,
    OrdersModule,
    BillsModule,
    BillStyleModule,
    ProfitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
