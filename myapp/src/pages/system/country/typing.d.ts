export declare namespace API {
  /**
   * 国家列表项
   */
  type CountryListItem = {
    id: number;
    name: string;
    englishName: string;
    sort?: number;
    status: 'enabled' | 'disabled';
    createdAt?: string;
    updatedAt?: string;
  };

  /**
   * 国家列表响应
   */
  type CountryListResponse = {
    data: CountryListItem[];
    total: number;
    success: boolean;
  };

  /**
   * 添加国家请求
   */
  type AddCountryRequest = Omit<CountryListItem, 'id' | 'createdAt' | 'updatedAt' | 'sort'>;

  /**
   * 更新国家请求
   */
  type UpdateCountryRequest = Omit<CountryListItem, 'sort'>;

  /**
   * 删除国家请求
   */
  type RemoveCountryRequest = {
    key: string[];
  };
} 