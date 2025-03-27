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
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
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
