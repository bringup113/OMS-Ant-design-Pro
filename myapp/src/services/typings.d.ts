declare namespace API {
  type CurrentUser = {
    id: number;
    username: string;
    organization_id: number;
    roles: {
      id: number;
      name: string;
      code: string;
    }[];
    permissions: string[];
    access?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
    token?: string;
    access_token?: string;
    user?: Record<string, any>;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type Agent = {
    id: number;
    name: string;
    contact: string;
    status: 'active' | 'inactive';
    cooperationType: 'regular' | 'commission';
    commissionRate?: number;
    createdAt: string;
    updatedAt: string;
  };

  type CreateAgentParams = {
    name: string;
    contact: string;
    status: string;
    cooperationType: 'regular' | 'commission';
    commissionRate?: number;
  };

  type UpdateAgentParams = {
    name?: string;
    contact?: string;
    status?: string;
    cooperationType?: 'regular' | 'commission';
    commissionRate?: number;
  };
} 