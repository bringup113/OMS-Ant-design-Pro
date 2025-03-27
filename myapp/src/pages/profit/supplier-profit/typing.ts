export type SupplierProfitItem = {
  id: number;
  supplierName: string;
  productName: string;
  purchasePrice: number;
  salePrice: number;
  profit: number;
  profitRate: number;
  commissionRate: number;
  commission: number;
  isAgentOrder: boolean;
  orderCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  settlementStatus: 'settled' | 'unsettled';
};

export type SupplierProfitParams = {
  pageSize?: number;
  current?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  settlementStatus?: string;
}; 