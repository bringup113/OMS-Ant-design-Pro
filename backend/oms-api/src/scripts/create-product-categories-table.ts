import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// 加载环境变量
config();

const configService = new ConfigService();

// 创建数据源
const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT') || '5432', 10),
  username: configService.get('DB_USERNAME') || 'postgres',
  password: configService.get('DB_PASSWORD') || 'postgres',
  database: configService.get('DB_DATABASE') || 'oms',
});

async function createProductCategoriesTable() {
  try {
    // 初始化数据源
    await dataSource.initialize();
    console.log('数据源已初始化');

    // 创建产品类别表
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        "parentId" INTEGER,
        sort INTEGER NOT NULL DEFAULT 0,
        status BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_parent FOREIGN KEY ("parentId") REFERENCES product_categories(id) ON DELETE SET NULL
      );
    `);
    console.log('产品类别表已创建');

    // 关闭数据源
    await dataSource.destroy();
    console.log('数据源已关闭');
  } catch (error) {
    console.error('创建产品类别表时出错:', error);
  }
}

// 执行函数
createProductCategoriesTable(); 