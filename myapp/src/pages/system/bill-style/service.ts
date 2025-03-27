import { request } from '@umijs/max';

// 获取所有账单样式模板
export async function getBillStyleTemplates() {
  return request('/api/bill-style', {
    method: 'GET',
  });
}

// 获取指定账单样式模板详情
export async function getBillStyleTemplate(id: number) {
  return request(`/api/bill-style/${id}`, {
    method: 'GET',
  });
}

// 创建新的账单样式模板
export async function createBillStyleTemplate(data: any) {
  return request('/api/bill-style', {
    method: 'POST',
    data,
  });
}

// 更新账单样式模板
export async function updateBillStyleTemplate(id: number, data: any) {
  return request(`/api/bill-style/${id}`, {
    method: 'PATCH',
    data,
  });
}

// 删除账单样式模板
export async function deleteBillStyleTemplate(id: number) {
  return request(`/api/bill-style/${id}`, {
    method: 'DELETE',
  });
}

// 设置默认账单样式模板
export async function setDefaultBillStyleTemplate(id: number) {
  return request(`/api/bill-style/${id}/default`, {
    method: 'POST',
  });
} 