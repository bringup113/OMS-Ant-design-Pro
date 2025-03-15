declare namespace API {
  type RoleListItem = {
    id?: string;
    key?: string;
    name?: string;
    code?: string;
    description?: string;
    sort?: number;
    status?: string;
    createdAt?: string;
    permissions?: string[];
    organizations?: string[];
    dataScope?: string; // 数据权限范围：all-全部数据, org-本机构数据, orgAndChild-本机构及下级机构数据, self-仅本人数据
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };
} 