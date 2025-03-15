#!/bin/bash

# 备份目录
BACKUP_DIR="/Users/brucelin/Desktop/OMS1/docker/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 备份PostgreSQL
echo "开始备份PostgreSQL数据库..."
docker exec oms_postgres pg_dump -U oms_user -d oms_database -F c -f /tmp/oms_backup_${TIMESTAMP}.dump
docker cp oms_postgres:/tmp/oms_backup_${TIMESTAMP}.dump ${BACKUP_DIR}/oms_backup_${TIMESTAMP}.dump
docker exec oms_postgres rm /tmp/oms_backup_${TIMESTAMP}.dump
echo "PostgreSQL备份完成: ${BACKUP_DIR}/oms_backup_${TIMESTAMP}.dump"

# 备份Redis
echo "开始备份Redis数据..."
docker exec oms_redis redis-cli -a oms_redis_password SAVE
docker cp oms_redis:/data/dump.rdb ${BACKUP_DIR}/redis_backup_${TIMESTAMP}.rdb
echo "Redis备份完成: ${BACKUP_DIR}/redis_backup_${TIMESTAMP}.rdb"

# 保留最近30天的备份
echo "清理30天前的备份文件..."
find ${BACKUP_DIR} -name "oms_backup_*.dump" -type f -mtime +30 -delete
find ${BACKUP_DIR} -name "redis_backup_*.rdb" -type f -mtime +30 -delete

echo "备份完成！" 