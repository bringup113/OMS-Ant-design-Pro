#!/bin/bash

# 打印分隔线函数
print_separator() {
  echo "=========================================================="
  echo "$1"
  echo "=========================================================="
}

print_separator "正在停止 OMS 系统服务"

# 停止前端服务（8000端口）
FRONTEND_PID=$(lsof -ti:8000)
if [ -n "$FRONTEND_PID" ]; then
  echo "正在停止前端服务（PID: $FRONTEND_PID）"
  kill -9 $FRONTEND_PID
  echo "前端服务已停止"
else
  echo "前端服务未运行"
fi

# 停止后端服务（3000端口）
BACKEND_PID=$(lsof -ti:3000)
if [ -n "$BACKEND_PID" ]; then
  echo "正在停止后端服务（PID: $BACKEND_PID）"
  kill -9 $BACKEND_PID
  echo "后端服务已停止"
else
  echo "后端服务未运行"
fi

print_separator "OMS系统已成功停止" 