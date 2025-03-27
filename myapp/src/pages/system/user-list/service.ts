// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getUsers(params: any, options?: any) {
  // 处理日期范围参数
  const { current, pageSize, startTime, endTime, ...restParams } = params;
  
  // 构建查询参数
  const queryParams = {
    current,
    pageSize,
    ...restParams,
  };
  
  // 如果有日期范围，添加到查询参数中
  if (startTime && endTime) {
    queryParams.dateRange = [startTime, endTime];
  }
  
  console.log('Fetching users with params:', queryParams);
  
  const response = await request<{
    data: API.UserListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('/api/users', {
    method: 'GET',
    params: queryParams,
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
  
  // 处理组织字段
  const dataToSend = {
    ...restParams,
  };
  
  // 如果有组织代码，转换为组织ID
  if (dataToSend.organization) {
    // 确保 organization_id 是数字
    dataToSend.organization_id = parseInt(dataToSend.organization, 10) || null;
    delete dataToSend.organization;
  }
  
  // 将dataScope转换为data_scope
  if (dataToSend.dataScope) {
    dataToSend.data_scope = dataToSend.dataScope;
    delete dataToSend.dataScope;
  }
  
  console.log('发送更新用户数据:', dataToSend);
  
  return request(`/api/users/${id}`, {
    method: 'PATCH',
    data: dataToSend,
  });
}

export async function addUser(params: any) {
  // 移除后端不需要的字段
  const { id, key, createdAt, ...restParams } = params;
  
  // 处理组织字段
  const dataToSend = {
    ...restParams,
  };
  
  // 如果有组织代码，转换为组织ID
  if (dataToSend.organization) {
    // 确保 organization_id 是数字
    dataToSend.organization_id = parseInt(dataToSend.organization, 10) || null;
    delete dataToSend.organization;
  }
  
  // 将dataScope转换为data_scope
  if (dataToSend.dataScope) {
    dataToSend.data_scope = dataToSend.dataScope;
    delete dataToSend.dataScope;
  }
  
  console.log('发送添加用户数据:', dataToSend);
  
  return request('/api/users', {
    method: 'POST',
    data: dataToSend,
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

export async function resetUserPassword(userId: string, newPassword: string) {
  return request(`/api/users/${userId}`, {
    method: 'PATCH',
    data: {
      password: newPassword,
    },
    skipErrorHandler: true,
  });
} 