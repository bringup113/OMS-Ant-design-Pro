/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
import type { InitialState } from './app';

export default (initialState: InitialState) => {
  const { currentUser } = initialState || {};
  
  return {
    canAdmin: currentUser?.access === 'admin',
    normalUser: currentUser?.access === 'user',
    routeFilter: true,
    isSupplier: currentUser?.roles?.some(role => role.code === 'SUPPLIER'),
    'system.user-list': currentUser?.permissions?.includes('system.user-list'),
    'system.organization': currentUser?.permissions?.includes('system.organization'),
    'system.role': currentUser?.permissions?.includes('system.role'),
    'system.category': currentUser?.permissions?.includes('system.category'),
    'system.country': currentUser?.permissions?.includes('system.country'),
    customer: currentUser?.permissions?.includes('customer'),
    'order.order-list': currentUser?.permissions?.includes('order.order-list'),
  };
};
