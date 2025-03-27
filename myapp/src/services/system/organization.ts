import { request } from '@umijs/max';

export async function getOrganizations(params: API.PageParams & { [key: string]: any }) {
  try {
    const response = await request<{
      data: API.Organization[];
      total: number;
      success: boolean;
    }>('/api/organizations', {
      method: 'GET',
      params: {
        ...params,
      },
    });

    return {
      data: response.data.map(org => ({
        ...org,
        parentId: org.parentId || undefined,
      })),
      total: response.total,
      success: response.success,
    };
  } catch (error) {
    console.error('获取机构列表失败:', error);
    return {
      data: [],
      total: 0,
      success: false,
    };
  }
}

export async function getOrganizationTree() {
  return request<{
    data: API.Organization[];
    success: boolean;
  }>('/api/organizations/tree', {
    method: 'GET',
  });
}

/** 获取供应商列表 GET /api/organizations/suppliers */
export async function getSuppliers() {
  try {
    const response = await request<API.RequestData<API.Organization>>('/api/organizations/suppliers', {
      method: 'GET',
    });

    return response.data.map(supplier => ({
      id: supplier.id,
      name: supplier.name || supplier.code || `供应商${supplier.id}`,
      status: supplier.status,
      type: supplier.type,
      parentId: supplier.parentId || undefined,
    }));
  } catch (error) {
    console.error('获取供应商列表失败:', error);
    throw error;
  }
}

export async function addOrganization(data: API.FormValueType) {
  return request<{
    data: API.Organization;
    success: boolean;
  }>('/api/organizations', {
    method: 'POST',
    data,
  });
}

export async function updateOrganization(id: number, data: API.FormValueType) {
  // 确保commission_rate为数字类型
  if (data.cooperation_type === 'profit_commission' && data.commission_rate !== undefined) {
    data.commission_rate = Number(data.commission_rate);
  }
  
  // 清理请求数据，删除不需要的字段
  const cleanData = { ...data } as any;
  
  // 删除后端不接受的字段
  delete cleanData.parent;
  delete cleanData.type;
  delete cleanData.createdAt;
  delete cleanData.updatedAt;
  delete cleanData.parentName;
  delete cleanData.id; // 删除ID，因为ID已经在URL路径中
  
  console.log('发送更新机构请求(清理后):', id, cleanData);
  
  return request<{
    data: API.Organization;
    success: boolean;
  }>(`/api/organizations/${id}`, {
    method: 'PATCH',
    data: cleanData,
  });
}

export async function removeOrganization(id: number) {
  return request<{
    success: boolean;
  }>(`/api/organizations/${id}`, {
    method: 'DELETE',
  });
} 