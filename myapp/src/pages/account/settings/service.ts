import { request } from '@umijs/max';
import type { CurrentUser } from './data';

export async function queryCurrent(): Promise<{ data: CurrentUser }> {
  return request('/api/auth/accountSettingCurrentUser');
}

export async function query() {
  return request('/api/users');
}
