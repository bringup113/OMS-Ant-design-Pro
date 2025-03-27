import { request } from '@umijs/max';
import type { AgentProfitItem, AgentProfitParams } from './typing';

// 获取代理商利润列表
export async function getAgentProfits(params: AgentProfitParams) {
  try {
    const response = await request('/api/profit/agent', {
      method: 'GET',
      params,
    });
    
    return {
      data: response.data || [],
      success: true,
      total: response.total || 0,
    };
  } catch (error) {
    console.error('获取代理商利润列表失败:', error);
    return {
      data: [],
      success: false,
      total: 0,
    };
  }
}

// 导出代理商利润数据
export async function exportAgentProfitData(params: AgentProfitParams) {
  return request('/api/profit/agent/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

// 更新代理商利润结算状态
export async function updateAgentProfitSettlementStatus(ids: number[], settlementStatus: 'settled' | 'unsettled') {
  return request('/api/profit/agent/settlement-status', {
    method: 'POST',
    data: {
      ids,
      settlementStatus,
    },
  });
} 