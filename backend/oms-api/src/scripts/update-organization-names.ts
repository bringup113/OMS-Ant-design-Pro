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
  entities: [],
});

async function main() {
  try {
    // 初始化连接
    await dataSource.initialize();
    console.log('数据库连接已初始化');

    // 更新组织名称
    const result = await dataSource.query(`
      UPDATE organizations 
      SET name = CONCAT('组织-', id) 
      WHERE name IS NULL OR name = '';
    `);
    console.log('组织名称更新完成', result);

    // 修改name字段为非空
    await dataSource.query(`
      ALTER TABLE organizations 
      ALTER COLUMN name SET NOT NULL;
    `);
    console.log('name字段已设置为非空');

    // 关闭连接
    await dataSource.destroy();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main(); 