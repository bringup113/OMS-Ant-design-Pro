// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getUsers(params: any, options?: any) {
  // 使用真实API
  console.log('Fetching users with params:', params);
  const response = await request<{
    data: API.UserListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('/api/users', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
  
  console.log('Raw API response:', response);
  
  // 在Umi的request中，response已经是响应体了，不是AxiosResponse
  // 但为了安全起见，我们仍然做一些检查
  const responseData = response as any;
  
  return {
    data: Array.isArray(responseData.data) ? responseData.data : [],
    total: responseData.total || 0,
    success: responseData.success || false,
  };
}

export async function updateUser(params: any) {
  // 移除后端不需要的字段
  const { id, key, createdAt, ...restParams } = params;
  
  return request(`/api/users/${id}`, {
    method: 'PATCH',
    data: restParams,
  });
}

export async function addUser(params: any) {
  // 移除后端不需要的字段
  const { id, key, createdAt, ...restParams } = params;
  
  return request('/api/users', {
    method: 'POST',
    data: restParams,
  });
}

export async function removeUser(params: { key: (string | undefined)[] }) {
  // 确保key是有效的字符串
  const key = params.key[0];
  if (!key) {
    throw new Error('无效的用户ID');
  }
  
  return request(`/api/users/${key}`, {
    method: 'DELETE',
    skipErrorHandler: true,
  });
} 