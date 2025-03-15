declare namespace API {
  type UserListItem = {
    id?: string;
    key?: string;
    username?: string;
    name?: string;
    email?: string;
    organization?: string;
    role?: string;
    status?: string;
    createdAt?: string;
    avatar?: string;
    profile?: string;
    dataScope?: string; // 数据权限范围：all-全部数据, org-本机构数据, orgAndChild-本机构及下级机构数据, self-仅本人数据
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };
}
