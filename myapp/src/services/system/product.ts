import { request } from '@umijs/max';
import type { ProductItem, ProductFormData } from '@/pages/product/list/typing';

/** 获取产品列表 GET /api/product/items */
export async function getProducts(params: {
  current?: number;
  pageSize?: number;
  country?: string;
  name?: string;
  category?: string;
  categoryId?: number;
}) {
  return request<{
    data: ProductItem[];
    total?: number;
    success?: boolean;
  }>('/api/product/items', {
    method: 'GET',
    params,
  });
}

/** 创建产品 POST /api/product/items */
export async function createProduct(data: ProductFormData) {
  return request<{
    data: ProductItem;
    success?: boolean;
  }>('/api/product/items', {
    method: 'POST',
    data,
  });
}

/** 更新产品 PUT /api/product/items/:id */
export async function updateProduct(id: number, data: ProductFormData) {
  return request<{
    data: ProductItem;
    success?: boolean;
  }>(`/api/product/items/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 删除产品 DELETE /api/product/items/:id */
export async function deleteProduct(id: number) {
  return request<{
    success?: boolean;
  }>(`/api/product/items/${id}`, {
    method: 'DELETE',
  });
} 