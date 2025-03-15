# OMS系统数据库与缓存部署指南

本目录包含用于部署OMS系统数据库(PostgreSQL)和缓存(Redis)的Docker配置。

## 部署步骤

1. 确保已安装Docker和Docker Compose
2. 在当前目录执行以下命令启动服务：

```bash
docker-compose up -d
```

## 服务访问信息

### PostgreSQL数据库

- **主机**: 192.168.8.199
- **端口**: 5432
- **用户名**: oms_user
- **密码**: oms_password
- **数据库名**: oms_database
- **连接URL**: `postgresql://oms_user:oms_password@192.168.8.199:5432/oms_database`

### Redis缓存

- **主机**: 192.168.8.199
- **端口**: 6379
- **密码**: oms_redis_password
- **连接URL**: `redis://:oms_redis_password@192.168.8.199:6379`

## 管理工具

- **pgAdmin (PostgreSQL管理工具)**: http://192.168.8.199:5050
  - 邮箱: admin@example.com
  - 密码: admin_password

## 常用命令

- 启动服务: `docker-compose up -d`
- 停止服务: `docker-compose down`
- 查看日志: `docker-compose logs -f`
- 重启服务: `docker-compose restart`

## 注意事项

1. 生产环境部署前请修改所有默认密码
2. 数据存储在Docker卷中，确保定期备份
3. 如需修改配置，请编辑docker-compose.yml文件后重启服务 