import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });
config();

async function checkTables() {
  console.log('创建数据源连接...');
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    console.log('初始化数据源...');
    await dataSource.initialize();
    console.log('数据源初始化成功');

    // 查询所有表
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('数据库表列表:');
    tables.forEach((table: any) => {
      console.log(`- ${table.table_name}`);
    });

    // 检查我们创建的表是否存在
    const permissionAuditTable = tables.find((t: any) => t.table_name === 'permission_audit_logs');
    const dataPermissionTable = tables.find((t: any) => t.table_name === 'data_permissions');

    if (permissionAuditTable) {
      console.log('\n✅ 权限审计日志表已创建');
    } else {
      console.log('\n❌ 权限审计日志表未创建');
    }

    if (dataPermissionTable) {
      console.log('✅ 数据权限表已创建');
    } else {
      console.log('❌ 数据权限表未创建');
    }

    // 检查users表是否有token相关字段
    const userColumns = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);

    const tokenExpiresColumn = userColumns.find((c: any) => c.column_name === 'token_expires_at');
    const tokenRefreshColumn = userColumns.find((c: any) => c.column_name === 'last_token_refresh');

    if (tokenExpiresColumn && tokenRefreshColumn) {
      console.log('✅ 用户表token字段已添加');
    } else {
      console.log('❌ 用户表token字段未完全添加');
    }
  } catch (error) {
    console.error('检查表时发生错误:', error);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n数据源连接已关闭');
    }
  }
}

checkTables()
  .then(() => console.log('脚本执行完成'))
  .catch(error => console.error('脚本执行失败:', error)); 