declare namespace API {
  type Organization = {
    id: number;
    name: string;
    code?: string;
    parentId?: number | undefined;
    parentName?: string;
    parent?: {
      id: number;
      name: string;
      type: 'supplier' | 'customer';
    } | undefined;
    type: 'supplier' | 'customer';
    status: '0' | '1';
    cooperation_type?: 'no_commission' | 'normal_trade' | 'profit_commission';
    createdAt: string;
    updatedAt: string;
    sort?: number;
  };

  type OrganizationListItem = Organization;

  type PageParams = {
    current?: number;
    pageSize?: number;
    keyword?: string;
  };

  type FormValueType = {
    name: string;
    code?: string;
    parentId?: number | undefined;
    status: '0' | '1';
    cooperation_type?: 'no_commission' | 'normal_trade' | 'profit_commission';
    type?: 'supplier' | 'customer';
    commission_rate?: number;
  };

  type RequestData<T> = {
    data: T[];
    success: boolean;
    total: number;
  };
} 