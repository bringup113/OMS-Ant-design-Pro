declare namespace API {
  // 通用响应格式
  interface BaseResponse<T = any> {
    success: boolean;
    data: T;
    total?: number;
    message?: string;
  }

  // 分页参数
  interface PageParams {
    current?: number;
    pageSize?: number;
  }

  // 客户列表项
  interface CustomerItem {
    id: number;
    name: string;
    passportNo: string;
    gender: 'male' | 'female';
    country: string;
    birthDate: number | null;
    issueDate: number | null;
    expiryDate: number | null;
    visaCount?: number;
    createdAt?: string;
    updatedAt?: string;
  }

  // 客户列表查询参数
  interface CustomerListParams extends PageParams {
    name?: string;
    passportNo?: string;
    country?: string;
  }

  // 签证列表项
  interface VisaListItem {
    id: number;
    customerId: number;
    country: string;
    visaName: string;
    issueDate: number | null;
    expiryDate: number | null;
    createdAt?: string;
    updatedAt?: string;
  }

  // 签证表单数据
  interface VisaFormData {
    id?: number;
    customerId: number;
    country: string;
    visaName: string;
    issueDate: number | null;
    expiryDate: number | null;
  }

  // 客户表单数据
  interface CustomerFormData {
    id?: number;
    name: string;
    passportNo: string;
    gender: 'male' | 'female';
    country: string;
    birthDate: number | null;
    issueDate: number | null;
    expiryDate: number | null;
  }
} 