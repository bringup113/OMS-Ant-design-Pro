#!/bin/bash

# 打印分隔线函数
print_separator() {
  echo "=========================================================="
  echo "$1"
  echo "=========================================================="
}

# 设置工作目录为脚本所在目录
cd "$(dirname "$0")"

# 构建前端
print_separator "开始构建前端应用"
cd myapp
npm run build
print_separator "前端应用构建完成"

# 构建后端
print_separator "开始构建后端应用"
cd ../backend/oms-api
npm run build
print_separator "后端应用构建完成"

# 返回项目根目录
cd ../../

# 使用Docker Compose启动应用
print_separator "使用Docker Compose启动应用"
docker-compose down
docker-compose build
docker-compose up -d

print_separator "应用已成功部署"
echo "前端应用可通过 http://localhost 访问"
echo "后端API仅内部可访问: http://localhost:3000"

print_separator "部署完成" 