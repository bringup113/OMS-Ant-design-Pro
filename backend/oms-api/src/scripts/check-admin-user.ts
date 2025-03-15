import { DataSource } from 'typeorm';
import { config } from 'dotenv';

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

    // 查询admin用户
    const user = await dataSource.query(
      `SELECT * FROM users WHERE username = 'admin'`
    );
    
    if (user.length > 0) {
      console.log('找到admin用户:');
      console.log(JSON.stringify(user[0], null, 2));
      
      // 查询用户角色
      const roles = await dataSource.query(
        `SELECT r.* FROM roles r 
         JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = $1`,
        [user[0].id]
      );
      
      console.log('用户角色:');
      console.log(JSON.stringify(roles, null, 2));
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