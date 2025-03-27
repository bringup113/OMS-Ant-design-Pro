// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { API } from './typing.d';

/**
 * 获取国家列表
 * @param params 查询参数
 */
export async function getCountries(params: {
  pageSize?: number;
  current?: number;
  keyword?: string;
}) {
  return request('/api/countries', {
    method: 'GET',
    params,
  });
}

/**
 * 添加国家
 * @param params 国家数据
 */
export async function addCountry(params: API.CountryListItem) {
  return request('/api/countries', {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新国家
 * @param params 国家数据
 */
export async function updateCountry(params: API.CountryListItem) {
  const { id, ...data } = params;
  return request(`/api/countries/${id}`, {
    method: 'PATCH',
    data,
  });
}

/**
 * 删除国家
 * @param params 包含要删除的国家ID
 */
export async function removeCountry(params: { key: string[] }) {
  return request('/api/countries', {
    method: 'DELETE',
    data: params,
  });
} 