import { request } from '@umijs/max';

export async function getProductCategories(params: any, options?: { [key: string]: any }) {
  // 删除供应商相关参数处理
  // if (params && params.supplierId !== undefined) {
  //   params.supplierId = Number(params.supplierId);
  // }
  
  return request('/api/product/categories', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 获取产品类别树 GET /api/product/categories/tree */
export async function getProductCategoryTree() {
  // 删除供应商相关参数
  // const params = supplierId !== undefined ? { supplierId: Number(supplierId) } : {};
  
  return request('/api/product/categories/tree', {
    method: 'GET',
    // params,
  });
}

/** 获取已启用的产品类别树 GET /api/product/categories/enabled */
export async function getEnabledProductCategoryTree() {
  // 删除供应商相关参数
  // const params = supplierId !== undefined ? { supplierId: Number(supplierId) } : {};
  
  return request('/api/product/categories/enabled', {
    method: 'GET',
    // params,
  });
}

export async function addProductCategory(data: any, options?: { [key: string]: any }) {
  const processedData = { ...data };
  // 删除供应商相关参数处理
  // if (processedData.supplierId !== undefined) {
  //   processedData.supplierId = Number(processedData.supplierId);
  // }
  if (processedData.parentId !== undefined) {
    processedData.parentId = Number(processedData.parentId);
  }
  
  return request('/api/product/categories', {
    method: 'POST',
    data: processedData,
    ...(options || {}),
  });
}

export async function updateProductCategory(id: number, data: any, options?: { [key: string]: any }) {
  const processedData = { ...data };
  // 删除供应商相关参数处理
  // if (processedData.supplierId !== undefined) {
  //   processedData.supplierId = Number(processedData.supplierId);
  // }
  if (processedData.parentId !== undefined) {
    processedData.parentId = Number(processedData.parentId);
  }
  
  return request(`/api/product/categories/${id}`, {
    method: 'PATCH',
    data: processedData,
    ...(options || {}),
  });
}

export async function removeProductCategory(id: number, options?: { [key: string]: any }) {
  return request(`/api/product/categories/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取已启用的产品类别树（TreeSelect格式） GET /api/product/categories/enabled-tree-select */
export async function getEnabledProductCategoryTreeSelect() {
  // 删除供应商相关参数
  // const params = supplierId !== undefined ? { supplierId: Number(supplierId) } : {};
  
  return request('/api/product/categories/enabled-tree-select', {
    method: 'GET',
    // params,
  });
} 