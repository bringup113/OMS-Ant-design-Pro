import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissionEnhancements1711562400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建权限审计日志表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permission_audit_logs (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NULL,
        role_id INT NULL,
        permission_id INT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        old_value TEXT NULL,
        new_value TEXT NULL,
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_user_id (user_id),
        INDEX idx_role_id (role_id),
        INDEX idx_permission_id (permission_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at),
        CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT fk_audit_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
        CONSTRAINT fk_audit_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 创建数据权限表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS data_permissions (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        filter VARCHAR(255) NOT NULL,
        description TEXT NULL,
        is_active TINYINT(1) DEFAULT 1,
        role_id INT NULL,
        data_scope VARCHAR(50) DEFAULT 'org',
        start_date DATETIME NULL,
        end_date DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_role_id (role_id),
        INDEX idx_resource (resource),
        INDEX idx_is_active (is_active),
        CONSTRAINT fk_dataperm_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 添加 token_expires_at 字段到 users 表，用于令牌刷新机制
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN token_expires_at TIMESTAMP NULL,
      ADD COLUMN last_token_refresh TIMESTAMP NULL;
    `);

    // 创建初始的数据权限规则
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
      WHERE r.code = 'ADMIN' OR r.code = 'SUPER_ADMIN';
      
      INSERT INTO data_permissions (name, resource, filter, description, role_id, data_scope)
      SELECT 
        CONCAT('普通用户', r.name, '数据'), 
        'order', 
        'order.organization_id = :organizationId', 
        CONCAT('普通用户仅可查看本机构', r.name, '订单数据'), 
        r.id, 
        'org'
      FROM roles r
      WHERE r.code = 'USER';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除表
    await queryRunner.query(`DROP TABLE IF EXISTS permission_audit_logs;`);
    await queryRunner.query(`DROP TABLE IF EXISTS data_permissions;`);
    
    // 移除字段
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN token_expires_at,
      DROP COLUMN last_token_refresh;
    `);
  }
} 