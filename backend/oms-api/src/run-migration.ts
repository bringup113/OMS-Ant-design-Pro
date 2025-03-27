import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { CreateProfitTablesFixed1711546999000 } from './migrations/1711546999000-CreateProfitTablesFixed';

async function runMigration() {
  // 加载环境变量
  config();
  
  const configService = new ConfigService();
  
  // 创建数据源
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [],
  });

  // 连接数据库
  await dataSource.initialize();
  
  try {
    console.log('Running CreateProfitTablesFixed1711546999000 migration...');
    
    const migration = new CreateProfitTablesFixed1711546999000();
    await migration.up(dataSource.createQueryRunner());
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // 关闭数据库连接
    await dataSource.destroy();
  }
}

runMigration().catch(error => {
  console.error('Error running migration:', error);
  process.exit(1);
}); 