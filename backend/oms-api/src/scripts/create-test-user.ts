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

    // 检查用户是否已存在
    const existingUser = await dataSource.query(
      `SELECT * FROM users WHERE username = 'testadmin'`
    );

    if (existingUser.length > 0) {
      console.log('用户 testadmin 已存在，更新密码');
      
      // 生成密码哈希
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      // 更新用户密码
      await dataSource.query(
        `UPDATE users SET password = $1 WHERE username = 'testadmin'`,
        [hashedPassword]
      );
      
      console.log('密码已更新');
    } else {
      console.log('创建新用户 testadmin');
      
      // 生成密码哈希
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      // 获取默认组织ID
      const org = await dataSource.query(
        `SELECT id FROM organizations LIMIT 1`
      );
      
      const orgId = org.length > 0 ? org[0].id : null;
      
      // 创建新用户
      const result = await dataSource.query(
        `INSERT INTO users (username, password, name, email, status, organization_id) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['testadmin', hashedPassword, '测试管理员', 'testadmin@example.com', '1', orgId]
      );
      
      const userId = result[0].id;
      console.log(`用户已创建，ID: ${userId}`);
      
      // 获取管理员角色
      const role = await dataSource.query(
        `SELECT id FROM roles WHERE code = 'admin' LIMIT 1`
      );
      
      if (role.length > 0) {
        const roleId = role[0].id;
        
        // 分配角色给用户
        await dataSource.query(
          `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
          [userId, roleId]
        );
        
        console.log(`已分配管理员角色给用户`);
      }
    }

    // 同时更新admin用户的密码
    const hashedPassword = await bcrypt.hash('admin', 10);
    await dataSource.query(
      `UPDATE users SET password = $1 WHERE username = 'admin'`,
      [hashedPassword]
    );
    console.log('admin用户密码已更新');

    // 关闭连接
    await dataSource.destroy();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main(); 