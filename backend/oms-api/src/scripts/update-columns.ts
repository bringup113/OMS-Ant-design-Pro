import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// 加载环境变量
config({ path: join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'oms',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('数据库连接成功');

    // 执行SQL更新字段类型
    await AppDataSource.query(`ALTER TABLE customers ALTER COLUMN "birthDate" TYPE varchar(10)`);
    console.log('已更新 customers.birthDate 类型');
    
    await AppDataSource.query(`ALTER TABLE customers ALTER COLUMN "issueDate" TYPE varchar(10)`);
    console.log('已更新 customers.issueDate 类型');
    
    await AppDataSource.query(`ALTER TABLE customers ALTER COLUMN "expiryDate" TYPE varchar(10)`);
    console.log('已更新 customers.expiryDate 类型');
    
    await AppDataSource.query(`ALTER TABLE visas ALTER COLUMN "issueDate" TYPE varchar(10)`);
    console.log('已更新 visas.issueDate 类型');
    
    await AppDataSource.query(`ALTER TABLE visas ALTER COLUMN "expiryDate" TYPE varchar(10)`);
    console.log('已更新 visas.expiryDate 类型');

    console.log('所有字段类型更新完成');
  } catch (error) {
    console.error('执行失败:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('数据库连接已关闭');
    }
  }
}

run(); 