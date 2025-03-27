import { request } from '@umijs/max';
import type { OrderListData, OrderItem, QueryParams } from './data.d';
import { message } from 'antd';

/**
 * 获取订单列表数据
 * @param params 查询参数
 */
export async function queryFakeList(
  params: QueryParams,
): Promise<OrderListData> {
  try {
    // 处理关键词搜索参数
    const queryParams = {...params};
    
    // 如果提供了关键词搜索条件，添加到查询参数中
    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }
    
    const response = await request('/api/orders', {
      params: queryParams,
    });
    
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      success: true,
    };
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      success: false,
    };
  }
}

/**
 * 删除订单
 * @param params 包含订单ID的参数对象
 */
export async function removeFakeList(
  params: { id: string },
): Promise<{ success: boolean; message?: string }> {
  try {
    // 使用真实API
    const response = await request(`/api/orders/${params.id}`, {
      method: 'DELETE',
    });
    
    console.log('删除订单响应:', response);
    
    return {
      success: response?.success || false,
      message: response?.message || '删除成功'
    };
  } catch (error: any) {
    console.error('删除订单失败:', error);
    
    // 处理后端返回的具体错误信息
    let errorMessage = '删除失败，请稍后重试';
    
    if (error.response) {
      // 尝试解析后端返回的错误信息
      try {
        const errorData = await error.response.clone().json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // 解析失败，使用默认错误信息
      }
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
}

/**
 * 获取订单详情
 * @param id 订单ID
 */
export async function getOrderDetail(id: number): Promise<{ data: OrderItem | null; success: boolean }> {
  try {
    const response = await request(`/api/orders/${id}`);
    return {
      data: response.data || null,
      success: true,
    };
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return {
      data: null,
      success: false,
    };
  }
}

/**
 * 更新订单状态
 * @param id 订单ID
 * @param status 新状态
 */
export async function updateOrderStatus(
  id: number, 
  status: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await request(`/api/orders/${id}/status`, {
      method: 'PUT',
      data: { status },
    });
    return {
      success: true,
      message: '状态更新成功',
    };
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return {
      success: false,
      message: '更新状态失败，请稍后重试',
    };
  }
}

/**
 * 获取订单评论列表
 * @param orderId 订单ID
 */
export async function getOrderComments(orderId: number): Promise<{ data: any[]; success: boolean }> {
  try {
    const response = await request(`/api/orders/${orderId}/comments`);
    return {
      data: response.data || [],
      success: true,
    };
  } catch (error) {
    console.error('获取订单评论失败:', error);
    return {
      data: [],
      success: false,
    };
  }
}

/**
 * 添加订单评论
 * @param orderId 订单ID
 * @param content 评论内容
 */
export async function addOrderComment(
  orderId: number,
  content: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await request(`/api/orders/${orderId}/comments`, {
      method: 'POST',
      data: { content },
    });
    
    return {
      success: true,
      message: '评论添加成功',
    };
  } catch (error) {
    console.error('添加评论失败:', error);
    return {
      success: false,
      message: '添加评论失败，请稍后重试',
    };
  }
}

/**
 * 更新业务状态
 * @param orderId 订单ID
 * @param businessId 业务ID
 * @param status 新状态
 */
export async function updateBusinessStatus(
  orderId: number,
  businessId: number,
  status: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`更新业务状态: orderId=${orderId}, businessId=${businessId}, status=${status}`);
    
    // 使用Nest.js API端点
    const response = await request(`/api/orders/${orderId}/businesses/${businessId}/status`, {
      method: 'PATCH',
      data: { status },
    });
    
    console.log('业务状态更新响应:', response);
    
    return {
      success: response?.success || false,
      message: response?.message || '业务状态已更新',
    };
  } catch (error) {
    console.error('更新业务状态失败:', error);
    return {
      success: false,
      message: '更新业务状态失败，请稍后重试',
    };
  }
}

// 获取账单样式模板列表
export async function getBillStyleTemplates() {
  return request('/api/bill-style', {
    method: 'GET',
  });
}

// 创建账单
export async function createBill(data: {
  orderIds: (string | number)[];
  templateId: number;
  remark?: string;
}) {
  // 确保订单ID是数字类型
  const orderIds = data.orderIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
  
  return request('/api/bills', {
    method: 'POST',
    data: {
      ...data,
      orderIds,
    },
  });
}

// 获取账单详情
export async function getBillDetail(id: number) {
  return request(`/api/bills/${id}`, {
    method: 'GET',
  });
}

/**
 * 获取账单关联的订单
 * @param id 账单ID
 */
export async function getBillOrders(id: number) {
  return request(`/api/bills/${id}/orders`);
}
