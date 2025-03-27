export type Member = {
  avatar: string;
  name: string;
  id: string;
};

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

// 代理类型
export type Agent = {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

// 实际API返回的订单数据类型
export interface OrderItem {
  id: number;
  customerId: number;
  customer?: {
    id: number;
    name: string;
    passportNo: string;
    gender: string;
    country: string;
    birthDate: string;
    issueDate: string;
    expiryDate: string;
    createdAt: string;
    updatedAt: string;
  };
  totalAmount: string;
  paymentStatus: string;
  accountStatus: string;
  accountBook?: {
    id: number;
    name: string;
    createdAt?: string;
  };
  agentId: number | null;
  agent?: Agent;
  remark: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  businesses: any[];
  status: 'pending' | 'processing' | 'completed' | 'canceled' | 'cancelled';
  billId?: number;
}

// 查询参数类型
export type QueryParams = {
  page?: number;
  pageSize?: number;
  count?: number;
  id?: string | number;
  status?: string;
  keyword?: string;
};

export type OrderListData = {
  data: OrderItem[];
  total: number;
  page: number;
  limit: number;
  success: boolean;
};

// 评论类型
export interface Comment {
  id: number;
  orderId: number;
  content: string;
  createdBy: number;
  createdByUser?: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
