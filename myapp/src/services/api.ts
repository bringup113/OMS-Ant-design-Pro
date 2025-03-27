import { request } from '@umijs/max';

// 添加订单评论
export async function addOrderComment(orderId: number, content: string) {
  return request(`/api/orders/${orderId}/comments`, {
    method: 'POST',
    data: { content },
  });
}

// 获取订单评论列表
export async function getOrderComments(orderId: number) {
  return request(`/api/orders/${orderId}/comments`, {
    method: 'GET',
  });
} 