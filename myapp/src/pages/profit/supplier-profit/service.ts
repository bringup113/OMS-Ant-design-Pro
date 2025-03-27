import { request } from '@umijs/max';
import type { SupplierProfitItem, SupplierProfitParams } from './typing';

// 获取供应商利润列表
export async function getSupplierProfits(params: SupplierProfitParams) {
  try {
    const response = await request('/api/profit/supplier', {
      method: 'GET',
      params,
    });
    
    return {
      data: response.data || [],
      success: true,
      total: response.total || 0,
    };
  } catch (error) {
    console.error('获取供应商利润列表失败:', error);
    return {
      data: [],
      success: false,
      total: 0,
    };
  }
}

// 导出供应商利润数据
export async function exportSupplierProfitData(params: SupplierProfitParams) {
  return request('/api/profit/supplier/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

// 更新供应商利润结算状态
export async function updateSupplierProfitSettlementStatus(ids: number[], settlementStatus: 'settled' | 'unsettled') {
  return request('/api/profit/supplier/settlement-status', {
    method: 'POST',
    data: {
      ids,
      settlementStatus,
    },
  });
} 