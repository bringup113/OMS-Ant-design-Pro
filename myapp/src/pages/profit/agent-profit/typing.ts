export type AgentProfitItem = {
  id: number;
  agentName: string;
  productName: string;
  orderId?: number;
  orderBusinessId?: number;
  agentPrice: number;
  salePrice: number;
  profit: number;
  profitRate: number;
  commissionRate: number;
  commission: number;
  orderCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  settlementStatus: 'settled' | 'unsettled';
};

export type AgentProfitParams = {
  pageSize?: number;
  current?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  settlementStatus?: string;
}; 