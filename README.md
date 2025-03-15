# OMS-Ant-design-Pro

订单管理系统，基于Ant Design Pro和Umi框架开发。

## 项目结构

- `myapp/`: 前端代码
- `backend/`: 后端API服务

## 开发环境启动

### 前端

```bash
cd myapp
npm install
npm run dev
```

### 后端

```bash
cd backend
npm install
npm run start:dev
```

## 主要功能

- 用户管理
- 角色管理
- 权限管理
- 组织机构管理
- 订单管理
- 客户管理
- 产品管理

## 系统架构

- 前端：React + Ant Design Pro + UmiJS
- 后端：NestJS + TypeORM + PostgreSQL
- 认证：JWT

## 权限系统设计

系统采用RBAC（基于角色的访问控制）模型，主要包含以下组件：

1. 用户（User）：系统的使用者
2. 角色（Role）：用户的身份和职责分类
3. 权限组（Permission Group）：权限的逻辑分组
4. 组织机构（Organization）：组织架构，具有层级关系
5. 权限（Permission）：系统功能的访问控制点

权限控制分为功能权限和数据权限两个维度：
- 功能权限：控制用户可以执行哪些操作
- 数据权限：控制用户可以访问哪些数据范围 