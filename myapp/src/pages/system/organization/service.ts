// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getOrgs(params: any, options?: any) {
  return request('/api/organizations', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateOrg(params: any) {
  return request(`/api/organizations/${params.id}`, {
    method: 'PATCH',
    data: {
      ...params,
      // 确保parentId正确传递
      parentId: params.parentId === '0' ? null : params.parentId,
    },
  });
}

export async function addOrg(params: any) {
  return request('/api/organizations', {
    method: 'POST',
    data: {
      ...params,
      // 确保parentId正确传递
      parentId: params.parentId === '0' ? null : params.parentId,
    },
  });
}

export async function removeOrg(params: { key: string[] }) {
  return request(`/api/organizations/${params.key[0]}`, {
    method: 'DELETE',
    // 添加错误处理选项，让组件自己处理错误
    skipErrorHandler: true,
  });
}
