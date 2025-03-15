declare namespace API {
  type OrganizationListItem = {
    id?: string;
    key?: string;
    name?: string;
    code?: string;
    parentId?: string;
    parentName?: string;
    sort?: number;
    status?: string;
    createdAt?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };
} 