import { request } from '@umijs/max';

export interface CountryListParams {
  current?: number;
  pageSize?: number;
  name?: string;
  englishName?: string;
  status?: string;
  sorter?: Record<string, any>;
}

export interface CountryItem {
  id: number;
  name: string;
  englishName: string;
  sort: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getCountries(params?: CountryListParams) {
  return request('/api/countries', {
    method: 'GET',
    params,
  });
}

export async function getCountryDetail(id: number) {
  return request(`/api/countries/${id}`, {
    method: 'GET',
  });
}

export async function createCountry(data: Omit<CountryItem, 'id' | 'createdAt' | 'updatedAt'>) {
  return request('/api/countries', {
    method: 'POST',
    data,
  });
}

export async function updateCountry(id: number, data: Partial<Omit<CountryItem, 'id' | 'createdAt' | 'updatedAt'>>) {
  return request(`/api/countries/${id}`, {
    method: 'PATCH',
    data,
  });
}

export async function deleteCountry(id: number) {
  return request(`/api/countries/${id}`, {
    method: 'DELETE',
  });
}

export async function batchDeleteCountries(ids: number[]) {
  return request('/api/countries', {
    method: 'DELETE',
    data: {
      key: ids,
    },
  });
} 