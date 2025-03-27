import { history } from '@umijs/max';
import { message } from 'antd';
import type { RequestConfig } from '@umijs/max';
import type { RequestOptions } from '@@/plugin-request/request';
import type { AxiosResponse } from 'axios';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      
      if (error.response) {
        const status = error.response.status;
        
        // 处理401未授权错误
        if (status === 401) {
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/user/login') {
            history.push(`/user/login?redirect=${encodeURIComponent(currentPath)}`);
          }
          return;
        }
        
        // 对于409冲突错误，不显示默认错误消息
        if (status === 409) {
          console.log('409 Conflict error, will be handled by component');
          return;
        }
        
        // 显示错误消息
        const errorMessage = error.response.data?.message || '请求失败';
        message.error(errorMessage);
      } else if (error.request) {
        message.error('服务器无响应，请重试');
      } else {
        message.error('请求错误，请重试');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      const token = localStorage.getItem('token');
      const { url = '' } = config;
      
      // 获取API基础路径，优先使用环境变量中定义的
      const API_BASE = (window as any).API_URL || '';
      
      // 构建完整URL
      let fullUrl = url;
      
      // 如果不是完整URL且存在API基础路径，则添加基础路径
      if (!url.startsWith('http') && API_BASE && !url.startsWith(API_BASE)) {
        fullUrl = `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
      }
      
      // 如果是登录相关的API，不需要token
      if (url.includes('/auth/login')) {
        return {
          ...config,
          url: fullUrl,
        };
      }
      
      // 检查token
      if (!token) {
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== '/user/login') {
          history.push(`/user/login?redirect=${encodeURIComponent(currentPath)}`);
        }
        return {
          ...config,
          url: fullUrl,
        };
      }
      
      // 确保 headers 存在
      const headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      return { 
        ...config,
        url: fullUrl,
        headers,
        // 添加重试配置
        retry: 3,
        retryDelay: 1000,
      };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response: AxiosResponse) => {
      // 拦截响应数据，进行个性化处理
      const { data, status } = response;
      
      // 处理401未授权
      if (status === 401 || (data && data.code === 401)) {
        // token过期，清除token并跳转到登录页
        localStorage.removeItem('token');
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== '/user/login') {
          history.push(`/user/login?redirect=${encodeURIComponent(currentPath)}`);
        }
        return response;
      }
      
      // 处理业务错误
      if (data && data.success === false) {
        message.error(data.message || '请求失败');
      }
      
      return response;
    },
  ],
};
