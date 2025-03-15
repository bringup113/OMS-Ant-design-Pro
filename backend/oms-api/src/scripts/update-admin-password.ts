import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

// 加载环境变量
config();

// 创建数据源
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'oms',
  entities: [],
});

async function main() {
  try {
    // 初始化连接
    await dataSource.initialize();
    console.log('数据库连接已初始化');

    // 生成密码哈希
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    // 更新admin用户的密码
    const result = await dataSource.query(
      `UPDATE users SET password = $1 WHERE username = 'admin' RETURNING id`,
      [hashedPassword]
    );
    
    if (result.length > 0) {
      console.log(`admin用户密码已更新，ID: ${result[0].id}`);
    } else {
      console.log('未找到admin用户');
    }

    // 关闭连接
    await dataSource.destroy();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main(); 