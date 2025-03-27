import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create-customer-tables')
  async createCustomerTables() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 创建customers表
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          "passportNo" VARCHAR(50) NOT NULL UNIQUE,
          gender VARCHAR(10) NOT NULL,
          country VARCHAR(50) NOT NULL,
          "birthDate" BIGINT NULL,
          "issueDate" BIGINT NULL,
          "expiryDate" BIGINT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
      
      // 创建visas表
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS visas (
          id SERIAL PRIMARY KEY,
          "customerId" INTEGER NOT NULL,
          country VARCHAR(50) NOT NULL,
          "visaType" VARCHAR(50) NOT NULL,
          "visaName" VARCHAR(100) NOT NULL,
          "issueDate" BIGINT NULL,
          "expiryDate" BIGINT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "FK_visas_customerId" FOREIGN KEY ("customerId") 
            REFERENCES customers(id) ON DELETE CASCADE
        )
      `);
      
      await queryRunner.commitTransaction();
      return { success: true, message: 'Customer tables created successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { success: false, error: error.message };
    } finally {
      await queryRunner.release();
    }
  }
}
