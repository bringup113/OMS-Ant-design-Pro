/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
      {
        component: '404',
        path: '/user/*',
      },
    ],
  },
  {
    path: '/customer',
    name: 'customer',
    icon: 'UserOutlined',
    component: './customer',
  },
  {
    path: '/customer/detail/:id',
    component: './customer/detail',
    hideInMenu: true,
  },
  {
    path: '/customer/create-customer',
    component: './customer/create-customer',
    hideInMenu: true,
  },
  {
    path: '/customer/edit/:id',
    component: './customer/edit',
    hideInMenu: true,
  },
  {
    path: '/order',
    name: 'order',
    icon: 'shopping',
    routes: [
      {
        path: '/order',
        redirect: '/order/order-list',
      },
      {
        name: 'order-list',
        icon: 'smile',
        path: '/order/order-list',
        component: './order/order-list',
      },
      {
        name: 'create-order',
        path: '/order/order-list/create',
        component: './order/order-list/create',
        hideInMenu: true,
      },
      {
        name: 'edit-order',
        path: '/order/order-list/edit/:id',
        component: './order/order-list/edit/[id]',
        hideInMenu: true,
      },
      {
        name: 'detail-order',
        path: '/order/order-list/detail/:id',
        component: './order/order-list/detail/[id]',
        hideInMenu: true,
      },
      {
        name: 'bill-management',
        icon: 'smile',
        path: '/order/bill-management',
        component: './order/bill-management',
      },
      {
        name: 'bill-detail',
        path: '/order/bill-management/detail/:id',
        component: './order/bill-management/detail',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/product',
    name: 'product',
    icon: 'appstore',
    routes: [
      {
        path: '/product',
        redirect: '/product/list',
      },
      {
        name: 'list',
        icon: 'smile',
        path: '/product/list',
        component: './product/list',
      },
      {
        path: '/product/quotation',
        name: 'quotation',
        component: './product/quotation',
      },
    ],
  },
  {
    path: '/agent',
    name: 'agent',
    icon: 'TeamOutlined',
    component: './Agents/List',
  },
  {
    path: '/profit',
    name: 'profit',
    icon: 'PropertySafetyOutlined',
    routes: [
      {
        path: '/profit',
        redirect: '/profit/supplier-profit',
      },
      {
        name: 'supplier-profit',
        icon: 'ShopOutlined',
        path: '/profit/supplier-profit',
        component: './profit/supplier-profit',
      },
      {
        name: 'agent-profit',
        icon: 'UserSwitchOutlined',
        path: '/profit/agent-profit',
        component: './profit/agent-profit',
      },
    ],
  },
  {
    path: '/system',
    name: 'system',
    icon: 'setting',
    routes: [
      {
        path: '/system',
        redirect: '/system/user-list',
      },
      {
        name: 'user-list',
        icon: 'user',
        path: '/system/user-list',
        component: './system/user-list',
      },
      {
        name: 'organization',
        icon: 'cluster',
        path: '/system/organization',
        component: './system/organization',
      },
      {
        name: 'role',
        icon: 'solution',
        path: '/system/role',
        component: './system/role',
      },
      {
        name: 'category',
        icon: 'appstore',
        path: '/system/category',
        component: './system/category',
      },
      {
        name: 'country',
        icon: 'global',
        path: '/system/country',
        component: './system/country',
      },
    ],
  },
  {
    path: '/',
    redirect: '/customer',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
