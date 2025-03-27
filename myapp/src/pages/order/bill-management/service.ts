import { request } from '@umijs/max';
import type { BasicListItemDataType, Bill } from './data.d';

type ParamsType = {
  status?: string;
  count?: number;
  [key: string]: any;
};

const api = '/api/bills';

// 真实API
export async function getBills(params: ParamsType) {
  try {
    const response = await request('/api/bills', {
      params,
    });
    
    // 确保返回的是数组
    let billsData = [];
    if (Array.isArray(response)) {
      billsData = response;
    } else if (response && typeof response === 'object') {
      // 如果是对象，尝试找到包含数组的属性
      const possibleArrayProps = ['data', 'bills', 'list', 'items'];
      for (const prop of possibleArrayProps) {
        if (Array.isArray(response[prop])) {
          billsData = response[prop];
          break;
        }
      }
    }
    
    return billsData; // 确保返回数组
  } catch (error) {
    console.error('获取账单失败:', error);
    return []; // 出错时返回空数组
  }
}

export async function getBillDetail(id: number) {
  return request(`/api/bills/${id}`);
}

export async function createBill(params: { orderIds: number[]; templateId: number; remark?: string }) {
  return request('/api/bills', {
    method: 'POST',
    data: params,
  });
}

export async function updateBill(id: number, params: { status?: string; [key: string]: any }) {
  return request(`/api/bills/${id}`, {
    method: 'PATCH',
    data: params,
  });
}

export async function deleteBill(id: number) {
  return request(`/api/bills/${id}`, {
    method: 'DELETE',
  });
}

export async function getBillOrders(billId: number) {
  return request(`/api/bills/${billId}/orders`);
}

// 获取代理商详情
export async function getAgentById(id: number) {
  return request(`/api/agents/${id}`);
}

// 获取账单付款记录
export async function getBillPayments(billId: number) {
  return request(`/api/bills/${billId}/payments`);
}

// 添加账单付款记录
export async function addBillPayment(billId: number, data: { 
  amount: number;
  remark?: string;
  paymentMethod?: string;
}) {
  return request(`/api/bills/${billId}/payments`, {
    method: 'POST',
    data,
  });
}

// 删除账单付款记录
export async function deletePaymentRecord(paymentId: number) {
  return request(`/api/bills/payments/${paymentId}`, {
    method: 'DELETE',
  });
}

// 此函数与getBillOrders功能相同，但保持命名一致
export async function getOrdersByBillId(id: number) {
  return request<any[]>(`${api}/${id}/orders`);
}

// 更新账单状态的快捷函数
export async function updateBillStatus(id: number, status: string) {
  return updateBill(id, { status });
}
