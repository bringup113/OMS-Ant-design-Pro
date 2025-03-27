import { request } from '@umijs/max';

// 获取代理列表
export async function getAgents() {
  return request<API.Agent[]>('/api/agents', {
    method: 'GET',
  });
}

// 获取单个代理详情
export async function getAgent(id: number) {
  return request<API.Agent>(`/api/agents/${id}`, {
    method: 'GET',
  });
}

// 创建代理
export async function createAgent(data: API.CreateAgentParams) {
  return request<API.Agent>('/api/agents', {
    method: 'POST',
    data,
  });
}

// 更新代理
export async function updateAgent(id: number, data: API.UpdateAgentParams) {
  return request<API.Agent>(`/api/agents/${id}`, {
    method: 'PATCH',
    data,
  });
}

// 删除代理
export async function deleteAgent(id: number) {
  return request<void>(`/api/agents/${id}`, {
    method: 'DELETE',
  });
} 