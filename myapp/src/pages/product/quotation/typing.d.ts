export interface QuotationItem {
  id: number;
  productId: number;
  product?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
    country?: string;
  };
  supplierId: number;
  supplier?: {
    id: number;
    name: string;
    code?: string;
  };
  price: number;
  agentPrice?: number;
  salePrice?: number;
  status: string;
  remark?: string;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  createdByUser?: {
    id: number;
    name: string;
  };
}

// 用于表单提交的数据类型
export interface QuotationFormData {
  productId: number;
  supplierId: number | { value: number; label: string };
  price: number;
  agentPrice?: number;
  salePrice?: number;
  status?: string;
  remark?: string;
  isLatest?: boolean;
  createdBy?: number;
}

declare namespace API {
  type QuotationListParams = {
    productId?: number;
    supplierId?: number;
    status?: string;
    pageSize?: number;
    current?: number;
    keyword?: string;
    is_latest?: boolean;
  };
} 