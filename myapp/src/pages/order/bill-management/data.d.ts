export type Member = {
  avatar: string;
  name: string;
  id: string;
};

// 模拟数据类型，用于兼容旧代码
export type BasicListItemDataType = {
  id: string;
  owner: string;
  title: string;
  avatar: string;
  cover: string;
  status: 'normal' | 'exception' | 'active' | 'success';
  percent: number;
  logo: string;
  href: string;
  body?: any;
  updatedAt: number;
  createdAt: number;
  subDescription: string;
  description: string;
  activeUser: number;
  newUser: number;
  star: number;
  like: number;
  message: number;
  content: string;
  members: Member[];
};

// 真实账单数据类型
export interface Bill {
  id: number;
  templateId: number;
  totalAmount: string;
  status: 'paid' | 'partially_paid' | 'unpaid';
  remark?: string;
  agentId?: number;
  agentName?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  orders?: any[];
  paymentRecords?: PaymentRecord[];
  paidAmount?: string;
}

export interface BillOrder {
  id: number;
  customerId: number;
  customerName: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: number;
  billId: number;
  amount: string;
  remark?: string;
  paymentMethod: string;
  paymentDate: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}
