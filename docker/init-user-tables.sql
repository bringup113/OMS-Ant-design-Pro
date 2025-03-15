-- 创建机构表
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES organizations(id),
    sort INTEGER DEFAULT 0,
    status CHAR(1) DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建权限表
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- menu, button, api
    parent_id INTEGER REFERENCES permissions(id),
    path VARCHAR(200),
    component VARCHAR(200),
    icon VARCHAR(100),
    sort INTEGER DEFAULT 0,
    status CHAR(1) DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort INTEGER DEFAULT 0,
    status CHAR(1) DEFAULT '1',
    data_scope VARCHAR(20) DEFAULT 'self', -- all, org, orgAndChild, self
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建角色-权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- 创建角色-机构关联表（适用机构）
CREATE TABLE IF NOT EXISTS role_organizations (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, organization_id)
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    avatar VARCHAR(255),
    profile TEXT,
    organization_id INTEGER REFERENCES organizations(id),
    status CHAR(1) DEFAULT '1',
    data_scope VARCHAR(20) DEFAULT 'self', -- all, org, orgAndChild, self
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户-角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 插入初始机构数据
INSERT INTO organizations (id, code, name, parent_id, sort, status)
VALUES 
(1, 'HQ', '总部', NULL, 0, '1'),
(2, 'BJ', '北京分公司', 1, 1, '1'),
(3, 'SH', '上海分公司', 1, 2, '1'),
(4, 'GZ', '广州分公司', 1, 3, '1');

-- 插入初始权限数据
INSERT INTO permissions (id, code, name, type, parent_id, path, component, icon, sort)
VALUES 
(1, 'dashboard', '仪表盘', 'menu', NULL, '/dashboard', 'Dashboard', 'dashboard', 0),
(2, 'system', '系统管理', 'menu', NULL, '/system', 'System', 'setting', 1),
(3, 'system.user-list', '用户管理', 'menu', 2, '/system/user-list', 'UserList', 'user', 0),
(4, 'system.organization', '机构管理', 'menu', 2, '/system/organization', 'Organization', 'cluster', 1),
(5, 'system.role', '角色管理', 'menu', 2, '/system/role', 'Role', 'team', 2),
(6, 'customer', '客户管理', 'menu', NULL, '/customer', 'Customer', 'user', 2),
(7, 'order', '订单管理', 'menu', NULL, '/order', 'Order', 'shopping', 3),
(8, 'order.order-list', '订单列表', 'menu', 7, '/order/order-list', 'OrderList', 'ordered-list', 0);

-- 插入初始角色数据
INSERT INTO roles (id, code, name, description, sort, status, data_scope)
VALUES 
(1, 'SUPER_ADMIN', '超级管理员', '拥有所有权限', 0, '1', 'all'),
(2, 'ADMIN', '管理员', '拥有大部分权限', 1, '1', 'org'),
(3, 'OPERATOR', '操作员', '拥有操作权限', 2, '1', 'self');

-- 插入角色-权限关联数据
INSERT INTO role_permissions (role_id, permission_id)
VALUES 
-- 超级管理员拥有所有权限
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- 管理员拥有大部分权限
(2, 1), (2, 2), (2, 3), (2, 4), (2, 6), (2, 7), (2, 8),
-- 操作员拥有操作权限
(3, 1), (3, 6), (3, 7), (3, 8);

-- 插入角色-机构关联数据
INSERT INTO role_organizations (role_id, organization_id)
VALUES 
-- 超级管理员适用于总部
(1, 1),
-- 管理员适用于北京、上海、广州分公司
(2, 2), (2, 3), (2, 4),
-- 操作员适用于北京、上海分公司
(3, 2), (3, 3);

-- 插入初始用户数据
INSERT INTO users (id, username, password, name, email, avatar, profile, organization_id, status, data_scope)
VALUES 
(1, 'admin', '$2a$10$OhfZv.uh5xPQQjyFmYlP0eQgbJwz.SvKWv9uHI1R0gzjXmMC3LFTW', '超级管理员', 'admin@example.com', 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png', '系统管理员，拥有所有权限', 1, '1', 'all'),
(2, 'operator1', '$2a$10$OhfZv.uh5xPQQjyFmYlP0eQgbJwz.SvKWv9uHI1R0gzjXmMC3LFTW', '小张', 'operator1@example.com', 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png', '北京分公司操作员，负责日常业务操作', 2, '1', 'org'),
(3, 'auditor1', '$2a$10$OhfZv.uh5xPQQjyFmYlP0eQgbJwz.SvKWv9uHI1R0gzjXmMC3LFTW', '审核大王', 'auditor1@example.com', 'https://gw.alipayobjects.com/zos/rmsportal/cnrhVkzwxjPwAaCfPbdc.png', '上海分公司审核员，负责业务审核', 3, '1', 'orgAndChild'),
(4, 'user1', '$2a$10$OhfZv.uh5xPQQjyFmYlP0eQgbJwz.SvKWv9uHI1R0gzjXmMC3LFTW', '阿广', 'user1@example.com', 'https://gw.alipayobjects.com/zos/rmsportal/WhxKECPNujWoWEFNdnJE.png', '广州分公司普通用户', 4, '0', 'self');

-- 插入用户-角色关联数据
INSERT INTO user_roles (user_id, role_id)
VALUES 
(1, 1), -- admin是超级管理员
(2, 3), -- operator1是操作员
(3, 2), -- auditor1是管理员
(4, 3); -- user1是操作员

-- 密码说明：所有用户的密码都是"admin"，使用bcrypt加密 