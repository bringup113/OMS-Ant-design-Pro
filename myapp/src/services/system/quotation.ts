import { request } from '@umijs/max';
import type { QuotationItem, QuotationFormData } from '@/pages/product/quotation/typing';
import type { API } from '@/pages/product/quotation/typing';

/** 获取报价列表 GET /api/product/quotations */
export async function getQuotations(params: API.QuotationListParams) {
  return request<{
    data: QuotationItem[];
    total?: number;
    success?: boolean;
  }>('/api/product/quotations', {
    method: 'GET',
    params: {
      ...params,
      is_latest: true, // 默认只获取最新报价
    },
  });
}

/** 创建报价 POST /api/product/quotations */
export async function createQuotation(data: QuotationFormData) {
  // 确保数据类型正确
  let processedData = { ...data };
  
  // 处理supplierId
  if (processedData.supplierId && typeof processedData.supplierId === 'object') {
    processedData.supplierId = Number(processedData.supplierId.value);
  } else if (typeof processedData.supplierId === 'string') {
    processedData.supplierId = Number(processedData.supplierId);
  }
  
  // 处理价格字段
  if (processedData.price && typeof processedData.price === 'string') {
    processedData.price = Number(processedData.price);
  }
  
  if (processedData.agentPrice && typeof processedData.agentPrice === 'string') {
    processedData.agentPrice = Number(processedData.agentPrice);
  }
  
  if (processedData.salePrice && typeof processedData.salePrice === 'string') {
    processedData.salePrice = Number(processedData.salePrice);
  }
  
  console.log('发送到后端的数据:', processedData);
  
  return request<{
    data: QuotationItem;
    success?: boolean;
  }>('/api/product/quotations', {
    method: 'POST',
    data: processedData,
  });
}

/** 更新报价 POST /api/product/quotations/:id/update */
export async function updateQuotation(id: number, data: QuotationFormData) {
  // 确保数据类型正确
  let processedData = { ...data };
  
  // 处理supplierId
  if (processedData.supplierId && typeof processedData.supplierId === 'object') {
    processedData.supplierId = Number(processedData.supplierId.value);
  } else if (typeof processedData.supplierId === 'string') {
    processedData.supplierId = Number(processedData.supplierId);
  }
  
  // 处理价格字段
  if (processedData.price && typeof processedData.price === 'string') {
    processedData.price = Number(processedData.price);
  }
  
  if (processedData.agentPrice && typeof processedData.agentPrice === 'string') {
    processedData.agentPrice = Number(processedData.agentPrice);
  }
  
  if (processedData.salePrice && typeof processedData.salePrice === 'string') {
    processedData.salePrice = Number(processedData.salePrice);
  }
  
  console.log('发送到后端的更新数据:', processedData);
  
  return request<{
    data: QuotationItem;
    success?: boolean;
  }>(`/api/product/quotations/${id}/update`, {
    method: 'POST',
    data: processedData,
  });
}

/** 删除报价 DELETE /api/product/quotations/:id */
export async function deleteQuotation(id: number) {
  return request<{
    success?: boolean;
  }>(`/api/product/quotations/${id}`, {
    method: 'DELETE',
  });
}

/** 删除指定产品和供应商的所有报价 DELETE /api/product/quotations/product/:productId/supplier/:supplierId */
export async function deleteQuotationsByProductAndSupplier(productId: number, supplierId: number) {
  return request<{
    success?: boolean;
  }>(`/api/product/quotations/product/${productId}/supplier/${supplierId}`, {
    method: 'DELETE',
  });
}

/** 获取供应商下级列表 GET /api/organizations/suppliers/:id/children */
export async function getSupplierChildren(supplierId: number) {
  return request<{
    data: {
      id: number;
      name: string;
      code?: string;
      status: string;
    }[];
    success?: boolean;
  }>(`/api/organizations/suppliers/${supplierId}/children`, {
    method: 'GET',
  });
}

/** 获取报价历史记录 GET /api/product/quotations/history */
export async function getQuotationHistory(productId: number, supplierId: number) {
  return request<{
    data: QuotationItem[];
    success?: boolean;
  }>('/api/product/quotations/history', {
    method: 'GET',
    params: {
      productId,
      supplierId,
      is_latest: false, // 获取所有历史记录，包括非最新的
    },
  });
} 