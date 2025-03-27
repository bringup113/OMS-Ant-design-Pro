#!/bin/bash

# 检查3000端口是否被占用
PORT_PID=$(lsof -ti:3000)

# 如果端口被占用，杀死相关进程
if [ -n "$PORT_PID" ]; then
  echo "端口3000已被占用，正在杀死进程 PID: $PORT_PID"
  kill -9 $PORT_PID
  sleep 1
  echo "进程已终止"
fi

# 启动后端服务
echo "正在启动后端服务..."
npm run start:dev 