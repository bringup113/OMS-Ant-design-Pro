// 定义模板接口
export interface IBillStyleTemplate {
  id: number;
  name: string;
  isDefault: boolean;
  paperType: string;
  createdBy: number;
  elements?: IBillStyleElement[];
  headerElements?: IBillStyleElement[];
  bodyElements?: IBillStyleElement[];
  footerElements?: IBillStyleElement[];
  createdAt: Date;
  updatedAt: Date;
}

// 定义元素接口
export interface IBillStyleElement {
  id: number;
  elementId: string;
  type: string;
  content: string;
  align: string;
  section: string;
  isBold: boolean;
  isTitle: boolean;
  fontSize: number;
  sortOrder: number;
  template?: IBillStyleTemplate;
  templateId: number;
  createdAt: Date;
  updatedAt: Date;
} 