import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });
config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'oms_user',
  password: process.env.DB_PASSWORD || 'oms_password',
  database: process.env.DB_DATABASE || 'oms_database',
};

async function runMigration() {
  console.log('创建数据源连接...');
  const dataSource = new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: false,
    logging: true,
  });

  try {
    console.log('初始化数据源...');
    await dataSource.initialize();
    console.log('数据源初始化成功');

    const queryRunner = dataSource.createQueryRunner();

    console.log('执行权限增强迁移...');

    // 创建权限审计日志表
    console.log('创建权限审计日志表...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permission_audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
        role_id INTEGER NULL REFERENCES roles(id) ON DELETE SET NULL,
        permission_id INTEGER NULL REFERENCES permissions(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        old_value TEXT NULL,
        new_value TEXT NULL,
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON permission_audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_role_id ON permission_audit_logs(role_id);
      CREATE INDEX IF NOT EXISTS idx_audit_permission_id ON permission_audit_logs(permission_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action ON permission_audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON permission_audit_logs(created_at);
    `);

    // 创建数据权限表
    console.log('创建数据权限表...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS data_permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        filter VARCHAR(255) NOT NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        role_id INTEGER NULL REFERENCES roles(id) ON DELETE CASCADE,
        data_scope VARCHAR(50) DEFAULT 'org',
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_dataperm_role_id ON data_permissions(role_id);
      CREATE INDEX IF NOT EXISTS idx_dataperm_resource ON data_permissions(resource);
      CREATE INDEX IF NOT EXISTS idx_dataperm_is_active ON data_permissions(is_active);
    `);

    // 添加 token_expires_at 字段到 users 表，用于令牌刷新机制
    console.log('添加token相关字段到users表...');
    try {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP NULL,
        ADD COLUMN IF NOT EXISTS last_token_refresh TIMESTAMP NULL;
      `);
    } catch (error) {
      console.log('字段可能已存在，跳过添加token字段...');
    }

    // 创建初始的数据权限规则
    console.log('创建初始数据权限规则...');
    await queryRunner.query(`
      INSERT INTO data_permissions (name, resource, filter, description, role_id, data_scope)
      SELECT 
        CONCAT('管理员全部', r.name, '数据'), 
        'order', 
        '1=1', 
        CONCAT('管理员可查看所有', r.name, '订单数据'), 
        r.id, 
        'all'
      FROM roles r
      WHERE (r.code = 'ADMIN' OR r.code = 'SUPER_ADMIN')
      AND NOT EXISTS (
        SELECT 1 FROM data_permissions dp WHERE dp.role_id = r.id AND dp.resource = 'order'
      );
      
      INSERT INTO data_permissions (name, resource, filter, description, role_id, data_scope)
      SELECT 
        CONCAT('普通用户', r.name, '数据'), 
        'order', 
        'order.organization_id = :organizationId', 
        CONCAT('普通用户仅可查看本机构', r.name, '订单数据'), 
        r.id, 
        'org'
      FROM roles r
      WHERE r.code = 'USER'
      AND NOT EXISTS (
        SELECT 1 FROM data_permissions dp WHERE dp.role_id = r.id AND dp.resource = 'order'
      );
    `);

    console.log('权限增强迁移完成！');
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('数据源连接已关闭');
    }
  }
}

runMigration()
  .then(() => console.log('脚本执行完成'))
  .catch(error => console.error('脚本执行失败:', error)); 