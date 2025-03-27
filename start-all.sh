#!/bin/bash

# 打印分隔线函数
print_separator() {
  echo "=========================================================="
  echo "$1"
  echo "=========================================================="
}

# 启动后端
print_separator "启动后端服务"
cd backend/oms-api
./start.sh &
BACKEND_PID=$!

# 等待后端启动
sleep 5
print_separator "后端服务已启动（进程ID: $BACKEND_PID）"

# 启动前端
print_separator "启动前端服务"
cd ../../myapp
./start.sh &
FRONTEND_PID=$!

print_separator "前端服务已启动（进程ID: $FRONTEND_PID）"
print_separator "OMS系统已完全启动"
print_separator "后端API: http://localhost:3000"
print_separator "前端界面: http://localhost:8000"

# 等待用户按下 Ctrl+C
echo "按下 Ctrl+C 停止所有服务"
wait 