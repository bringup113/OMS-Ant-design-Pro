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

    // 检查表是否存在
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agents'
      );
    `;
    const tableExists = await AppDataSource.query(checkTableQuery);
    
    if (tableExists[0].exists) {
      console.log('代理表已存在，无需创建');
    } else {
      // 创建代理表
      const createTableQuery = `
        CREATE TABLE agents (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          contact VARCHAR(20) NOT NULL,
          status VARCHAR(10) NOT NULL DEFAULT 'active',
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        );
      `;
      await AppDataSource.query(createTableQuery);
      console.log('代理表创建成功');
    }

    // 将迁移记录插入到migrations表
    const insertMigrationQuery = `
      INSERT INTO migrations (timestamp, name) 
      VALUES (1742298711269, 'CreateAgentsTable1742298711269')
      ON CONFLICT DO NOTHING;
    `;
    await AppDataSource.query(insertMigrationQuery);
    console.log('迁移记录已更新');

    console.log('操作完成');
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