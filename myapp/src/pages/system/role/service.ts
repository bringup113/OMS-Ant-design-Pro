// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getRoles(params: any, options?: any) {
  // 从后端API获取真实数据
  return request('/api/roles', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateRole(params: any) {
  // 移除后端不需要的字段
  const { id, key, createdAt, ...restParams } = params;
  
  return request(`/api/roles/${id}`, {
    method: 'PATCH',
    data: restParams,
  });
}

export async function addRole(params: any) {
  // 移除后端不需要的字段
  const { id, key, createdAt, ...restParams } = params;
  
  return request('/api/roles', {
    method: 'POST',
    data: restParams,
  });
}

export async function removeRole(params: { key: string[] }) {
  return request(`/api/roles/${params.key[0]}`, {
    method: 'DELETE',
    skipErrorHandler: true,
  });
}