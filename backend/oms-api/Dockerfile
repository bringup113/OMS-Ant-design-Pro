FROM node:16-alpine

# 创建应用目录
WORKDIR /usr/src/app

# 安装应用依赖
COPY package*.json ./
RUN npm install

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"] 