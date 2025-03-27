declare namespace API {
  type OrganizationListItem = {
    id: number;
    name: string;
    code?: string;
    parentId?: number;
    parentName?: string;
    parent?: {
      id: number;
      name: string;
      type: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
    cooperation_type?: 'no_commission' | 'normal_trade' | 'profit_commission';
  };

  type OrganizationList = {
    data?: OrganizationListItem[];
    total?: number;
    success?: boolean;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };
} 