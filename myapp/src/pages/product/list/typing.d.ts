export interface ProductItem {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
    code?: string;
    parentId?: number;
    children?: any[];
  };
  categoryId: number;
  description?: string;
  country?: string;
  status: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

// 用于表单提交的数据类型
export interface ProductFormData {
  name: string;
  categoryId: number;
  description?: string;
  country?: string;
  status?: 'online' | 'offline';
} 