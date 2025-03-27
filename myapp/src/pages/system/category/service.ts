// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/**
 * 获取产品类别列表
 * @param params 查询参数
 */
export async function getProductCategories(params: {
  pageSize?: number;
  current?: number;
  keyword?: string;
  supplierId?: string;
}) {
  return request('/api/product/categories', {
    method: 'GET',
    params,
  });
}

/**
 * 获取产品类别树形结构
 * @param supplierId 供应商ID，如果提供则只获取该供应商的产品类别
 */
export async function getProductCategoryTree(supplierId?: string) {
  return request('/api/product/categories/tree', {
    method: 'GET',
    params: supplierId ? { supplierId } : {},
  });
}

/**
 * 添加产品类别
 * @param params 产品类别数据
 */
export async function addProductCategory(params: API.ProductCategoryListItem) {
  return request('/api/product/categories', {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新产品类别
 * @param params 产品类别数据
 */
export async function updateProductCategory(params: API.ProductCategoryListItem) {
  return request(`/api/product/categories/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除产品类别
 * @param params 包含要删除的产品类别ID
 */
export async function removeProductCategory(params: { key: string[] }) {
  return request('/api/product/categories', {
    method: 'DELETE',
    data: params,
  });
} 