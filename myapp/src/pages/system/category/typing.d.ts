export declare namespace API {
  type ProductCategoryListItem = {
    id: number;
    name: string;
    code: string;
    parentId?: number;
    parentName?: string;
    sort: number;
    status: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    children?: ProductCategoryListItem[];
  };

  type ProductCategoryList = {
    data?: ProductCategoryListItem[];
    total?: number;
    success?: boolean;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };
} 