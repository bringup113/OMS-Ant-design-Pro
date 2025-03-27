import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// 加载环境变量
const envFile = process.env.ENV_FILE || '.env';
config({ path: envFile });

console.log('使用环境变量文件:', envFile);
console.log('数据库配置:');
console.log('  主机:', process.env.DB_HOST);
console.log('  端口:', process.env.DB_PORT);
console.log('  用户名:', process.env.DB_USERNAME);
console.log('  数据库:', process.env.DB_DATABASE);

async function run() {
  console.log('正在创建订单相关表...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await dataSource.initialize();
    console.log('数据库连接成功');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'create-order-tables.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 按语句分割SQL脚本
    const statements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // 逐条执行SQL语句
    for (const statement of statements) {
      try {
        await dataSource.query(statement + ';');
        console.log('执行SQL成功:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('执行SQL失败:', statement.substring(0, 50) + '...');
        console.error('错误详情:', error);
      }
    }
    
    console.log('订单表和订单业务表创建完成');
  } catch (error) {
    console.error('数据库操作失败:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('数据库连接已关闭');
    }
  }
}

run().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
}); 