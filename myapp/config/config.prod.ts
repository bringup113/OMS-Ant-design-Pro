// @ts-nocheck
import { defineConfig } from '@umijs/max';
import routes from './routes';

// 定义生产环境配置
const config: any = {
  // 路由配置
  routes,

  // 生产环境特定配置
  define: {
    // 定义API基础URL
    API_URL: 'http://oms.tiancheng.xin/api',
  },

  // 生产环境不使用代理
  proxy: undefined,

  // 关闭SourceMap
  devtool: false,

  // 修改输出目录
  outputPath: './dist',
};

export default defineConfig(config); 