import { AvatarDropdown, AvatarName, SelectLang } from '@/components';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link, useIntl } from '@umijs/max';
import { App as AntApp, message, App } from 'antd';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// 配置 message 全局配置
message.config({
  duration: 2,
  maxCount: 3,
});

export interface Role {
  code: string;
  name: string;
}

export interface CurrentUser {
  access: string;
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  userid?: string;
  unreadCount?: number;
  roles?: Role[];
  permissions?: string[];
  permissionValue?: number;
}

export interface InitialState {
  currentUser?: CurrentUser;
  settings?: Partial<LayoutSettings>;
  loading?: boolean;
  fetchUserInfo?: () => Promise<CurrentUser | undefined>;
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<InitialState> {
  const fetchUserInfo = async () => {
    try {
      // 检查是否有token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      console.log('开始获取用户信息...');
      console.log('当前token:', token);
      
      const response = await queryCurrentUser({
        skipErrorHandler: true,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('获取到的用户信息响应:', response);
      
      // 检查并处理返回的数据结构
      if (!response) {
        throw new Error('No response from server');
      }

      return response as CurrentUser;
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      
      // 如果是 401 错误，清除 token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        history.push(loginPath);
      }
      
      return undefined;
    }
  };
  
  // 如果是登录页面，不执行
  const { location } = history;
  if (location.pathname === loginPath) {
    return {
      fetchUserInfo,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  
  // 如果不是登录页面，尝试获取用户信息
  try {
    console.log('初始化用户状态...');
    const currentUser = await fetchUserInfo();
    console.log('初始化用户状态完成:', currentUser);
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  } catch (error) {
    console.error('初始化用户状态失败:', error);
    return {
      fetchUserInfo,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: 'app.system.title' }),
    actionsRender: () => [<SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          <AntApp>
            {children}
          </AntApp>
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  ...errorConfig,
};

export function rootContainer(container: any) {
  return (
    <App>
      {container}
    </App>
  );
}
