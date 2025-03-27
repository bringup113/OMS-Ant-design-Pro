import { request } from '@umijs/max';

export interface CustomerListParams {
  current?: number;
  pageSize?: number;
  name?: string;
  passportNo?: string;
  country?: string;
}

export interface CustomerFormData {
  id?: number;
  name: string;
  passportNo: string;
  gender: string;
  country: string;
  birthDate: string | null;
  issueDate: string | null;
  expiryDate: string | null;
}

export interface VisaFormData {
  id?: number;
  customerId: number;
  country: string;
  visaName: string;
  issueDate: string | null;
  expiryDate: string | null;
}

// 获取客户列表
export async function getCustomers(params: CustomerListParams) {
  return request('/api/customers', {
    method: 'GET',
    params,
  });
}

// 获取客户详情
export async function getCustomerDetail(id: number) {
  return request(`/api/customers/${id}`, {
    method: 'GET',
  });
}

// 创建客户
export async function createCustomer(data: CustomerFormData) {
  return request('/api/customers', {
    method: 'POST',
    data,
  });
}

// 更新客户
export async function updateCustomer(id: number, data: CustomerFormData) {
  return request(`/api/customers/${id}`, {
    method: 'PATCH',
    data,
  });
}

// 删除客户
export async function deleteCustomer(id: number) {
  return request(`/api/customers/${id}`, {
    method: 'DELETE',
  });
}

// 获取客户的签证列表
export async function getCustomerVisas(customerId: number) {
  return request(`/api/customers/${customerId}/visas`, {
    method: 'GET',
  });
}

// 创建签证信息
export async function createVisa(data: VisaFormData) {
  return request('/api/visas', {
    method: 'POST',
    data,
  });
}

// 批量创建签证信息
export async function batchCreateVisas(customerId: number, visas: Omit<VisaFormData, 'customerId'>[], options?: {[key: string]: any}) {
  console.log(`客户端 - 批量创建签证请求`, {
    customerId,
    visaCount: visas.length,
    visaData: visas,
    options
  });
  
  try {
    const response = await request(`/api/customers/${customerId}/visas/batch`, {
      method: 'POST',
      data: visas,
      ...(options || {}),
    });
    
    console.log(`客户端 - 批量创建签证响应:`, response);
    return response;
  } catch (error) {
    console.error(`客户端 - 批量创建签证错误:`, error);
    throw error;
  }
}

// 更新签证信息
export async function updateVisa(id: number, data: Omit<VisaFormData, 'customerId'>) {
  return request(`/api/visas/${id}`, {
    method: 'PATCH',
    data,
  });
}

// 删除签证信息
export async function deleteVisa(id: number) {
  return request(`/api/visas/${id}`, {
    method: 'DELETE',
  });
} 