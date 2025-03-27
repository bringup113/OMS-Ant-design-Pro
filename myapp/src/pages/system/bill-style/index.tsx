import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Row, Col, Divider, Switch, List, Dropdown, Space, Modal, Tooltip, Select, Radio, InputNumber } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, DownOutlined, SaveOutlined, DragOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.less';
import {
  getBillStyleTemplates,
  getBillStyleTemplate,
  createBillStyleTemplate,
  updateBillStyleTemplate,
  deleteBillStyleTemplate,
  setDefaultBillStyleTemplate
} from './service';

const { TextArea } = Input;
const { Option } = Select;

// 定义小票元素类型
interface ReceiptElement {
  id: string;
  elementId?: string;
  type: 'text' | 'line' | 'order-item' | 'total' | 'custom-field' | 'remark';
  content?: string;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isTitle?: boolean;
  fontSize?: number;
  section?: 'header' | 'body' | 'footer';
  sortOrder?: number;
}

// 定义样式模板类型
interface BillStyleTemplate {
  id: string | number;
  name: string;
  isDefault?: boolean;
  paperType: 'a4'; // 纸张类型：A4
  elements: ReceiptElement[]; // 小票元素
  headerElements: ReceiptElement[]; // 小票头部元素
  bodyElements: ReceiptElement[]; // 小票主体元素
  footerElements: ReceiptElement[]; // 小票底部元素
}

// 初始样式模板数据
const initialTemplates: BillStyleTemplate[] = [
  {
    id: 'template-1',
    name: '默认账单样式',
    isDefault: true,
    paperType: 'a4',
    elements: [],
    headerElements: [
      { id: 'header-1', type: 'text', content: '天成旅行社', align: 'center', isBold: true, isTitle: true, fontSize: 16 },
      { id: 'header-2', type: 'text', content: '账单日期: {date}', align: 'right', fontSize: 12 },
      { id: 'header-6', type: 'text', content: '代理名称: {agentName}', align: 'right', fontSize: 12 },
      { id: 'header-7', type: 'line' },
    ],
    bodyElements: [
      { id: 'body-4', type: 'text', content: '订单明细', align: 'center', isBold: true, fontSize: 14 },
      { id: 'body-5', type: 'order-item' },
      { id: 'body-6', type: 'remark', content: '如有疑问请联系客服' },
      { id: 'body-7', type: 'total' },
      { id: 'body-8', type: 'line' },
    ],
    footerElements: [
      { id: 'footer-2', type: 'text', content: '感谢您的惠顾', align: 'center', fontSize: 12 },
    ]
  }
];

// 账单样式设置组件
const BillStyleSettings: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  
  // 样式模板状态
  const [templates, setTemplates] = useState<BillStyleTemplate[]>(initialTemplates);
  const [currentTemplate, setCurrentTemplate] = useState<BillStyleTemplate>(initialTemplates[0]);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [activeSection, setActiveSection] = useState<'header' | 'body' | 'footer'>('header');
  const [editingElement, setEditingElement] = useState<ReceiptElement | null>(null);
  const [isElementModalVisible, setIsElementModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 获取所有模板
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const templates = await getBillStyleTemplates();
      if (templates && templates.length > 0) {
        setTemplates(templates);
        // 找到默认模板
        const defaultTemplate = templates.find((t: BillStyleTemplate) => t.isDefault);
        if (defaultTemplate) {
          setCurrentTemplate(defaultTemplate);
        } else {
          setCurrentTemplate(templates[0]);
        }
      } else {
        // 创建一个默认模板
        message.info('系统中没有账单样式模板，将创建默认模板');
        await createDefaultTemplate();
      }
    } catch (error) {
      console.error('获取账单样式失败', error);
      message.error('获取账单样式失败，将使用本地默认模板');
      // 使用本地默认模板
      createDefaultTemplate();
    } finally {
      setLoading(false);
    }
  };

  // 创建默认模板的函数
  const createDefaultTemplate = async () => {
    try {
      // 创建默认元素
      const headerElements: ReceiptElement[] = [
        {
          id: 'header-1',
          elementId: 'header-1',
          type: 'text',
          content: '天成旅行社',
          align: 'center',
          isBold: true,
          isTitle: true,
          fontSize: 16,
          section: 'header',
          sortOrder: 0,
        },
        {
          id: 'header-2',
          elementId: 'header-2',
          type: 'text',
          content: '账单日期: {date}',
          align: 'left',
          fontSize: 12,
          section: 'header',
          sortOrder: 1,
        },
        {
          id: 'header-3',
          elementId: 'header-3',
          type: 'text',
          content: '账单号码: {billNo}',
          align: 'left',
          fontSize: 12,
          section: 'header',
          sortOrder: 2,
        },
        {
          id: 'header-4',
          elementId: 'header-4',
          type: 'line',
          section: 'header',
          sortOrder: 3,
        },
        {
          id: 'header-5',
          elementId: 'header-5',
          type: 'text',
          content: '代理信息',
          align: 'left',
          isBold: true,
          fontSize: 14,
          section: 'header',
          sortOrder: 4,
        },
        {
          id: 'header-6',
          elementId: 'header-6',
          type: 'text',
          content: '代理名称: {agentName}',
          align: 'left',
          fontSize: 12,
          section: 'header',
          sortOrder: 5,
        },
        {
          id: 'header-7',
          elementId: 'header-7',
          type: 'line',
          section: 'header',
          sortOrder: 6,
        }
      ];
      
      const bodyElements: ReceiptElement[] = [
        {
          id: 'body-1',
          elementId: 'body-1',
          type: 'text',
          content: '订单明细',
          align: 'center',
          isBold: true,
          fontSize: 14,
          section: 'body',
          sortOrder: 0,
        },
        {
          id: 'body-2',
          elementId: 'body-2',
          type: 'custom-field',
          content: '客户名称,护照号码,商品,价格,备注',
          align: 'center',
          isBold: true,
          fontSize: 12,
          section: 'body',
          sortOrder: 1,
        },
        {
          id: 'body-3',
          elementId: 'body-3',
          type: 'order-item',
          section: 'body',
          sortOrder: 2,
        },
        {
          id: 'body-4',
          elementId: 'body-4',
          type: 'line',
          section: 'body',
          sortOrder: 3,
        },
        {
          id: 'body-5',
          elementId: 'body-5',
          type: 'remark',
          content: '备注信息:',
          section: 'body',
          sortOrder: 4,
        },
        {
          id: 'body-6',
          elementId: 'body-6',
          type: 'total',
          section: 'body',
          sortOrder: 5,
        }
      ];
      
      const footerElements: ReceiptElement[] = [
        {
          id: 'footer-1',
          elementId: 'footer-1',
          type: 'line',
          section: 'footer',
          sortOrder: 0,
        },
        {
          id: 'footer-2',
          elementId: 'footer-2',
          type: 'text',
          content: '感谢您的惠顾',
          align: 'center',
          fontSize: 12,
          section: 'footer',
          sortOrder: 1,
        },
        {
          id: 'footer-3',
          elementId: 'footer-3',
          type: 'text',
          content: '如有疑问，请联系我们',
          align: 'center',
          fontSize: 12,
          section: 'footer',
          sortOrder: 2,
        }
      ];

      // 创建一个默认模板
      const defaultTemplate: BillStyleTemplate = {
        id: 'local-default',
        name: '默认账单样式',
        isDefault: true,
        paperType: 'a4',
        headerElements,
        bodyElements,
        footerElements,
        elements: [...headerElements, ...bodyElements, ...footerElements]
      };
      
      // 如果是本地默认模板，只设置本地状态
      if (typeof defaultTemplate.id === 'string' && defaultTemplate.id.startsWith('local-')) {
        setTemplates([defaultTemplate]);
        setCurrentTemplate(defaultTemplate);
      } else {
        // 否则发送到服务器
        try {
          const savedTemplate = await createBillStyleTemplate(defaultTemplate);
          if (savedTemplate) {
            setTemplates([savedTemplate]);
            setCurrentTemplate(savedTemplate);
            message.success('默认账单样式模板创建成功');
          }
        } catch (error) {
          console.error('创建默认模板失败', error);
          // 失败了也使用本地模板
          setTemplates([defaultTemplate]);
          setCurrentTemplate(defaultTemplate);
        }
      }
    } catch (error) {
      console.error('创建默认模板过程中出错', error);
      message.error('创建默认模板失败');
    }
  };

  // 获取模板详情
  const fetchTemplateDetail = async (id: string | number) => {
    setLoading(true);
    try {
      const response = await getBillStyleTemplate(Number(id));
      if (response) {
        setCurrentTemplate(response);
      } else {
        message.error('获取模板详情失败: 返回了空数据');
        // 使用本地默认模板
        if (templates.length > 0) {
          setCurrentTemplate(templates[0]);
        } else {
          // 如果没有可用模板，创建一个本地默认模板
          await createDefaultTemplate();
        }
      }
    } catch (error) {
      console.error('获取模板详情失败:', error);
      message.error('获取模板详情失败，将使用默认模板');
      // 尝试使用列表中的第一个模板
      if (templates.length > 0) {
        setCurrentTemplate(templates[0]);
      } else {
        // 如果没有可用模板，创建一个本地默认模板
        await createDefaultTemplate();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // 创建新样式
  const handleCreateTemplate = () => {
    setIsCreateMode(true);
    setTemplateName('');
    setIsNameModalVisible(true);
  };
  
  // 处理模板名称确认
  const handleNameConfirm = async () => {
    if (!templateName.trim()) {
      message.error('请输入样式名称');
      return;
    }
    
    if (isCreateMode) {
      try {
        // 创建新模板数据
        const newTemplateData = {
          name: templateName,
          isDefault: false,
          paperType: 'a4',
          headerElements: [
            { elementId: `header-${Date.now()}-1`, type: 'text', content: '天成旅行社', align: 'center', isBold: true, isTitle: true, fontSize: 16, section: 'header' },
            { elementId: `header-${Date.now()}-2`, type: 'text', content: '账单日期: {date}', align: 'right', fontSize: 12, section: 'header' },
            { elementId: `header-${Date.now()}-3`, type: 'text', content: '代理名称: {agentName}', align: 'right', fontSize: 12, section: 'header' },
            { elementId: `header-${Date.now()}-4`, type: 'line', section: 'header' },
          ],
          bodyElements: [
            { elementId: `body-${Date.now()}-1`, type: 'text', content: '订单明细', align: 'center', isBold: true, fontSize: 14, section: 'body' },
            { elementId: `body-${Date.now()}-2`, type: 'order-item', section: 'body' },
            { elementId: `body-${Date.now()}-3`, type: 'remark', content: '如有疑问请联系客服', section: 'body' },
            { elementId: `body-${Date.now()}-4`, type: 'total', section: 'body' },
            { elementId: `body-${Date.now()}-5`, type: 'line', section: 'body' },
          ],
          footerElements: [
            { elementId: `footer-${Date.now()}-1`, type: 'text', content: '谢谢惠顾', align: 'center', fontSize: 12, section: 'footer' },
          ]
        };
        
        const response = await createBillStyleTemplate(newTemplateData);
        if (response) {
          message.success('创建样式成功');
          await fetchTemplates();
          setCurrentTemplate(response);
        }
      } catch (error) {
        console.error('创建样式失败:', error);
        message.error('创建样式失败');
      }
    } else {
      // 重命名当前模板
      try {
        await updateBillStyleTemplate(Number(currentTemplate.id), {
          name: templateName
        });
        message.success('重命名成功');
        await fetchTemplates();
      } catch (error) {
        console.error('重命名失败:', error);
        message.error('重命名失败');
      }
    }
    
    setIsNameModalVisible(false);
    setIsCreateMode(false);
  };
  
  // 删除模板
  const handleDeleteTemplate = (templateId: string | number) => {
    // 查找要删除的模板
    const templateToDelete = templates.find(t => t.id === templateId);
    
    // 如果是默认模板，则不允许删除
    if (templateToDelete?.isDefault) {
      message.error('默认账单样式不可删除');
      return;
    }
    
    Modal.confirm({
      title: '删除样式',
      content: '确定要删除该样式吗？此操作不可撤销。',
      onOk: async () => {
        try {
          await deleteBillStyleTemplate(Number(templateId));
          message.success('样式已删除');
          await fetchTemplates();
        } catch (error) {
          console.error('删除样式失败:', error);
          message.error('删除样式失败');
        }
      }
    });
  };
  
  // 复制模板
  const handleCopyTemplate = async (template: BillStyleTemplate) => {
    try {
      const templateDetail = await getBillStyleTemplate(Number(template.id));
      if (templateDetail) {
        // 准备复制的数据
        const copyData = {
          name: `${template.name} 副本`,
          isDefault: false,
          paperType: template.paperType,
          headerElements: templateDetail.headerElements.map((el: any) => ({
            ...el,
            elementId: `${el.elementId}-copy-${Date.now()}`
          })),
          bodyElements: templateDetail.bodyElements.map((el: any) => ({
            ...el,
            elementId: `${el.elementId}-copy-${Date.now()}`
          })),
          footerElements: templateDetail.footerElements.map((el: any) => ({
            ...el,
            elementId: `${el.elementId}-copy-${Date.now()}`
          }))
        };
        
        const response = await createBillStyleTemplate(copyData);
        if (response) {
          message.success('已创建样式副本');
          await fetchTemplates();
          setCurrentTemplate(response);
        }
      }
    } catch (error) {
      console.error('复制样式失败:', error);
      message.error('复制样式失败');
    }
  };
  
  // 重命名模板
  const handleRenameTemplate = () => {
    setIsCreateMode(false);
    setTemplateName(currentTemplate.name);
    setIsNameModalVisible(true);
  };
  
  // 设为默认样式
  const handleSetDefault = async (templateId: string | number) => {
    try {
      await setDefaultBillStyleTemplate(Number(templateId));
      message.success('已设置为默认样式');
      await fetchTemplates();
    } catch (error) {
      console.error('设置默认样式失败:', error);
      message.error('设置默认样式失败');
    }
  };

  // 添加元素
  const handleAddElement = (section: 'header' | 'body' | 'footer') => {
    const newElement: ReceiptElement = {
      id: `${section}-${Date.now()}`,
      elementId: `${section}-${Date.now()}`,
      type: 'text',
      content: '新文本',
      align: 'left',
      fontSize: 12,
      section: section
    };

    setEditingElement(newElement);
    setActiveSection(section);
    setIsElementModalVisible(true);
  };

  // 编辑元素
  const handleEditElement = (element: ReceiptElement, section: 'header' | 'body' | 'footer') => {
    setEditingElement({...element});
    setActiveSection(section);
    setIsElementModalVisible(true);
  };

  // 保存元素
  const handleSaveElement = async (element: ReceiptElement) => {
    if (!element || !activeSection) return;

    // 确保元素有必要的属性
    const validatedElement = {
      ...element,
      elementId: element.elementId || `${element.id}-${Date.now()}`,
      section: element.section || activeSection,
      // 确保类型是有效的
      type: element.type || 'text',
      // 确保对齐方式是有效的
      align: element.align || 'left'
    };
    
    // 删除id属性，因为后端不需要它
    const { id, ...elementToSave } = validatedElement;

    const sectionKey = `${activeSection}Elements` as 'headerElements' | 'bodyElements' | 'footerElements';
    let updated = false;

    // 检查元素是否已存在，先确保currentTemplate[sectionKey]存在
    if (!currentTemplate[sectionKey]) {
      // 如果该区域元素数组不存在，创建一个新的
      const updatedTemplate = {
        ...currentTemplate,
        [sectionKey]: [validatedElement]
      };
      setCurrentTemplate(updatedTemplate);
      
      // 更新模板
      try {
        await updateBillStyleTemplate(Number(currentTemplate.id), {
          [sectionKey]: [elementToSave]
        });
        message.success('元素保存成功');
      } catch (error) {
        console.error('保存元素失败:', error);
        message.error('保存元素失败');
      }
    } else {
      // 检查元素是否已存在
      const updatedElements = currentTemplate[sectionKey].map(item => {
        if (item.id === element.id || (element.elementId && item.elementId === element.elementId)) {
          updated = true;
          return validatedElement;
        }
        return item;
      });

      // 如果是新元素，添加到数组末尾
      if (!updated) {
        updatedElements.push(validatedElement);
      }

      // 更新当前模板
      const updatedTemplate = {
        ...currentTemplate,
        [sectionKey]: updatedElements
      };

      setCurrentTemplate(updatedTemplate);
      
      // 准备提交给后端的数据 - 去除id字段
      const elementsToSave = updatedElements.map(el => {
        const { id, ...elementData } = el;
        return elementData;
      });
      
      // 更新模板
      try {
        await updateBillStyleTemplate(Number(currentTemplate.id), {
          [sectionKey]: elementsToSave
        });
        message.success('元素保存成功');
      } catch (error) {
        console.error('保存元素失败:', error);
        message.error('保存元素失败');
      }
    }
    
    setIsElementModalVisible(false);
    setEditingElement(null);
  };

  // 删除元素
  const handleDeleteElement = async (elementId: string, section: 'header' | 'body' | 'footer') => {
    const sectionKey = `${section}Elements` as 'headerElements' | 'bodyElements' | 'footerElements';
    
    // 确保元素数组存在
    if (!currentTemplate[sectionKey]) {
      message.error('该区域不存在任何元素');
      return;
    }
    
    // 过滤掉要删除的元素
    const updatedElements = currentTemplate[sectionKey].filter(item => {
      // 如果有elementId属性，则用elementId比较，否则用id比较
      if (item.elementId) {
        return item.elementId !== elementId;
      } else {
        return item.id !== elementId;
      }
    });
    
    // 更新当前模板
    const updatedTemplate = {
      ...currentTemplate,
      [sectionKey]: updatedElements
    };
    
    setCurrentTemplate(updatedTemplate);
    
    // 准备提交给后端的数据 - 去除id字段
    const elementsToSave = updatedElements.map(el => {
      const { id, ...elementData } = el;
      return elementData;
    });
    
    // 更新模板
    try {
      await updateBillStyleTemplate(Number(currentTemplate.id), {
        [sectionKey]: elementsToSave
      });
      message.success('元素删除成功');
    } catch (error) {
      console.error('删除元素失败:', error);
      message.error('删除元素失败');
    }
  };

  // 移动元素顺序
  const handleMoveElement = async (elementId: string, section: 'header' | 'body' | 'footer', direction: 'up' | 'down') => {
    const sectionKey = `${section}Elements` as 'headerElements' | 'bodyElements' | 'footerElements';
    
    // 确保元素数组存在
    if (!currentTemplate[sectionKey] || currentTemplate[sectionKey].length <= 1) {
      return; // 如果不存在元素或只有一个元素，则无法移动
    }
    
    const elements = [...currentTemplate[sectionKey]];
    const index = elements.findIndex(item => item.id === elementId || (item.elementId && item.elementId === elementId));
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      // 向上移动
      [elements[index - 1], elements[index]] = [elements[index], elements[index - 1]];
    } else if (direction === 'down' && index < elements.length - 1) {
      // 向下移动
      [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
    } else {
      return; // 已经是第一个或最后一个，不能再移动
    }
    
    // 更新排序号
    elements.forEach((element, idx) => {
      element.sortOrder = idx;
    });
    
    // 更新当前模板
    const updatedTemplate = {
      ...currentTemplate,
      [sectionKey]: elements
    };
    
    setCurrentTemplate(updatedTemplate);
    
    // 准备提交给后端的数据 - 去除id字段
    const elementsToSave = elements.map(el => {
      const { id, ...elementData } = el;
      return elementData;
    });
    
    // 更新模板
    try {
      await updateBillStyleTemplate(Number(currentTemplate.id), {
        [sectionKey]: elementsToSave
      });
      message.success('元素位置已调整');
    } catch (error) {
      console.error('移动元素失败:', error);
      message.error('移动元素失败');
    }
  };

  // 渲染小票元素
  const renderReceiptElement = (element: ReceiptElement) => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            className={styles.receiptText} 
            style={{ 
              textAlign: element.align || 'left',
              fontWeight: element.isBold ? 'bold' : 'normal',
              fontSize: `${element.fontSize || 12}px`,
              ...(element.isTitle ? { marginBottom: '8px' } : {})
            }}
          >
            {element.content}
          </div>
        );
      case 'line':
        return <div className={styles.receiptLine} />;
      case 'order-item':
        // 示例数据
        const orderData = [
          { customer: '张三', passport: 'P12345678', product: '商务签证', price: '$1500', remark: '加急处理' },
          { customer: '张三', passport: 'P12345678', product: '劳工证', price: '$1000', remark: '-' },
          { customer: '张三', passport: 'P12345678', product: '旅游保险', price: '$500', remark: '-' },
        ];
        
        // 定义类型
        interface Product {
          product: string;
          price: string;
          remark: string;
        }
        
        interface CustomerProducts {
          customer: string;
          passport: string;
          products: Product[];
        }
        
        // 处理数据，计算每个客户有多少个商品
        const customerProducts: Record<string, CustomerProducts> = {};
        orderData.forEach(item => {
          const key = `${item.customer}-${item.passport}`;
          if (!customerProducts[key]) {
            customerProducts[key] = {
              customer: item.customer,
              passport: item.passport,
              products: []
            };
          }
          customerProducts[key].products.push({
            product: item.product,
            price: item.price,
            remark: item.remark
          });
        });
        
        return (
          <div className={styles.orderItems}>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>客户姓名</th>
                  <th>护照号码</th>
                  <th>商品</th>
                  <th>价格</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(customerProducts).map((customer: CustomerProducts, index) => {
                  return customer.products.map((product: Product, productIndex: number) => (
                    <tr key={`${index}-${productIndex}`}>
                      {productIndex === 0 ? (
                        <>
                          <td rowSpan={customer.products.length}>{customer.customer}</td>
                          <td rowSpan={customer.products.length}>{customer.passport}</td>
                        </>
                      ) : null}
                      <td>{product.product}</td>
                      <td>{product.price}</td>
                      <td>{product.remark}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        );
      case 'remark':
        return (
          <div className={styles.remarkBox}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>备注信息:</div>
            <div style={{ minHeight: '40px', whiteSpace: 'pre-wrap' }}>{element.content || '如有疑问请联系客服'}</div>
          </div>
        );
      case 'total':
        return (
          <div className={styles.receiptTotal}>
            <div className={styles.totalItem}>
              <span>小计:</span>
              <span>$2,700</span>
            </div>
            <div className={styles.totalItem}>
              <span>已付金额:</span>
              <span>$0</span>
            </div>
            <div className={styles.totalItem} style={{ fontWeight: 'bold' }}>
              <span>合计:</span>
              <span>$2,700</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // 修改为一个组合元素的渲染方法
  const renderReceiptSection = () => {
    // 获取当前模板主体元素
    const bodyElements = currentTemplate.bodyElements;
    
    // 找到备注和合计元素的索引
    const remarkIndex = bodyElements.findIndex(el => el.type === 'remark');
    const totalIndex = bodyElements.findIndex(el => el.type === 'total');
    
    // 如果同时存在备注和合计元素，并且它们相邻（备注在前，合计在后）
    if (remarkIndex !== -1 && totalIndex !== -1 && totalIndex === remarkIndex + 1) {
      // 获取备注元素
      const remarkElement = bodyElements[remarkIndex];
      
      return (
        <div className={styles.remarkTotalRow}>
          <div className={styles.remarkCol}>
            <div className={styles.remarkBox}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>备注信息:</div>
              <div style={{ minHeight: '40px', whiteSpace: 'pre-wrap' }}>{remarkElement.content || '如有疑问请联系客服'}</div>
            </div>
          </div>
          <div className={styles.totalCol}>
            <div className={styles.receiptTotal}>
              <div className={styles.totalItem}>
                <span>小计:</span>
                <span>$2,700</span>
              </div>
              <div className={styles.totalItem}>
                <span>已付金额:</span>
                <span>$0</span>
              </div>
              <div className={styles.totalItem} style={{ fontWeight: 'bold' }}>
                <span>合计:</span>
                <span>$2,700</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // 如果不是相邻的，正常渲染每个元素
    return null;
  }

  return (
    <PageContainer title="账单样式设置">
      <Row gutter={24}>
        <Col span={8}>
          <Card
            title="样式列表"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateTemplate}
              >
                新建样式
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            <List
              dataSource={templates}
              renderItem={template => (
                <List.Item
                  actions={[
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'rename',
                            icon: <EditOutlined />,
                            label: '重命名',
                            onClick: () => {
                              setCurrentTemplate(template);
                              handleRenameTemplate();
                            }
                          },
                          {
                            key: 'copy',
                            icon: <CopyOutlined />,
                            label: '复制',
                            onClick: () => handleCopyTemplate(template)
                          },
                          {
                            key: 'setDefault',
                            label: '设为默认',
                            disabled: template.isDefault,
                            onClick: () => handleSetDefault(template.id)
                          },
                          {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: '删除',
                            danger: true,
                            disabled: template.isDefault,
                            onClick: () => handleDeleteTemplate(template.id)
                          }
                        ]
                      }}
                    >
                      <a>
                        <Space>
                          操作
                          <DownOutlined />
                        </Space>
                      </a>
                    </Dropdown>
                  ]}
                  className={currentTemplate.id === template.id ? styles.selectedTemplate : ''}
                  onClick={() => setCurrentTemplate(template)}
                >
                  <div className={styles.templateItem}>
                    <span>{template.name}</span>
                    {template.isDefault && <span className={styles.defaultTag}>默认</span>}
                  </div>
                </List.Item>
              )}
            />
          </Card>

          <Card
            title="布局编辑"
            className={styles.editArea}
            tabList={[
              {
                key: 'header',
                tab: '头部区域',
              },
              {
                key: 'body',
                tab: '主体区域',
              },
              {
                key: 'footer',
                tab: '底部区域',
              },
            ]}
            activeTabKey={activeSection}
            onTabChange={(key) => setActiveSection(key as 'header' | 'body' | 'footer')}
            extra={
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleAddElement(activeSection)}
              >
                添加元素
              </Button>
            }
          >
            <div className={styles.elementsContainer}>
              {currentTemplate && currentTemplate[`${activeSection}Elements` as 'headerElements' | 'bodyElements' | 'footerElements'] && 
               currentTemplate[`${activeSection}Elements` as 'headerElements' | 'bodyElements' | 'footerElements'].map((element, index) => (
                <div key={element.id} className={styles.elementItem}>
                  <div className={styles.elementInfo}>
                    <span>{element.type === 'text' ? `文本: ${element.content}` : 
                           element.type === 'line' ? '分隔线' : 
                           element.type === 'order-item' ? '订单明细' : 
                           element.type === 'remark' ? '备注信息' : '合计金额'}</span>
                  </div>
                  <div className={styles.elementActions}>
                    <Button 
                      icon={<UpOutlined />} 
                      size="small"
                      disabled={index === 0}
                      onClick={() => handleMoveElement(element.id, activeSection, 'up')}
                    />
                    <Button 
                      icon={<DownOutlined />} 
                      size="small"
                      disabled={index === (currentTemplate && currentTemplate[`${activeSection}Elements` as 'headerElements' | 'bodyElements' | 'footerElements'] ? currentTemplate[`${activeSection}Elements` as 'headerElements' | 'bodyElements' | 'footerElements'].length - 1 : 0)}
                      onClick={() => handleMoveElement(element.id, activeSection, 'down')}
                    />
                    <Button 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => handleEditElement(element, activeSection)}
                    />
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small"
                      danger
                      onClick={() => handleDeleteElement(element.id, activeSection)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card
            title={`编辑样式: ${currentTemplate.name}`}
            extra={
              <Tooltip title="保存当前样式">
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={async () => {
                    try {
                      await updateBillStyleTemplate(Number(currentTemplate.id), currentTemplate);
                      message.success('样式已保存');
                      await fetchTemplates();
                    } catch (error) {
                      console.error('保存样式失败:', error);
                      message.error('保存样式失败');
                    }
                  }}
                >
                  保存修改
                </Button>
              </Tooltip>
            }
          >
            <div className={styles.previewArea}>
              <div 
                className={styles.receiptPreview} 
                style={{ 
                  width: '210mm',
                  minHeight: '297mm',
                  backgroundColor: '#FFF'
                }}
              >
                <div className={styles.receiptHeader}>
                  {currentTemplate.headerElements && currentTemplate.headerElements.map(element => (
                    <div key={element.id}>
                      {renderReceiptElement(element)}
                    </div>
                  ))}
                </div>
                <div className={styles.receiptBody}>
                  {currentTemplate.bodyElements && currentTemplate.bodyElements.map((element, index) => {
                    // 如果当前元素是备注，且下一个元素是合计，则跳过两者的独立渲染
                    if (element.type === 'remark' && 
                        index + 1 < (currentTemplate.bodyElements?.length || 0) && 
                        currentTemplate.bodyElements[index + 1].type === 'total') {
                      // 渲染组合元素
                      return <div key={element.id}>{renderReceiptSection()}</div>;
                    }
                    // 如果当前元素是合计，且前一个元素是备注，则跳过（因为已经在备注中渲染了）
                    else if (element.type === 'total' && 
                             index > 0 && 
                             currentTemplate.bodyElements[index - 1].type === 'remark') {
                      return null;
                    }
                    // 否则正常渲染
                    return (
                      <div key={element.id}>
                        {renderReceiptElement(element)}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.receiptFooter}>
                  {currentTemplate.footerElements && currentTemplate.footerElements.map(element => (
                    <div key={element.id}>
                      {renderReceiptElement(element)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 样式名称输入弹窗 */}
      <Modal
        title={isCreateMode ? "创建新样式" : "重命名样式"}
        open={isNameModalVisible}
        onOk={handleNameConfirm}
        onCancel={() => setIsNameModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item
            label="样式名称"
            required
            rules={[{ required: true, message: '请输入样式名称' }]}
          >
            <Input
              placeholder="请输入样式名称"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 元素编辑弹窗 */}
      <Modal
        title="编辑元素"
        open={isElementModalVisible}
        onOk={() => handleSaveElement(editingElement!)}
        onCancel={() => {
          setIsElementModalVisible(false);
          setEditingElement(null);
        }}
      >
        {editingElement && (
          <Form layout="vertical" initialValues={editingElement}>
            <Form.Item label="元素类型" name="type">
              <Select 
                value={editingElement.type}
                onChange={value => setEditingElement({...editingElement, type: value})}
              >
                <Option value="text">文本</Option>
                <Option value="line">分隔线</Option>
                {activeSection === 'body' && (
                  <>
                    <Option value="order-item">订单明细</Option>
                    <Option value="remark">备注信息</Option>
                    <Option value="total">合计金额</Option>
                  </>
                )}
              </Select>
            </Form.Item>
            
            {editingElement.type === 'text' && (
              <>
                <Form.Item label="文本内容">
                  <Input 
                    value={editingElement.content}
                    onChange={e => setEditingElement({...editingElement, content: e.target.value})}
                    placeholder="输入文本内容，可使用 {date}, {billNo}, {customerName} 等变量"
                  />
                </Form.Item>
                
                <Form.Item label="对齐方式">
                  <Radio.Group 
                    value={editingElement.align}
                    onChange={e => setEditingElement({...editingElement, align: e.target.value})}
                  >
                    <Radio value="left">左对齐</Radio>
                    <Radio value="center">居中</Radio>
                    <Radio value="right">右对齐</Radio>
                  </Radio.Group>
                </Form.Item>
                
                <Form.Item label="字体大小">
                  <InputNumber 
                    min={8} 
                    max={24} 
                    value={editingElement.fontSize}
                    onChange={value => setEditingElement({...editingElement, fontSize: value as number})}
                  />
                </Form.Item>
                
                <Form.Item label="样式选项">
                  <div>
                    <Switch 
                      checked={editingElement.isBold}
                      onChange={checked => setEditingElement({...editingElement, isBold: checked})}
                    /> 加粗
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Switch 
                      checked={editingElement.isTitle}
                      onChange={checked => setEditingElement({...editingElement, isTitle: checked})}
                    /> 标题样式
                  </div>
                </Form.Item>
              </>
            )}
            
            {editingElement.type === 'remark' && (
              <Form.Item label="备注内容">
                <TextArea 
                  value={editingElement.content}
                  onChange={e => setEditingElement({...editingElement, content: e.target.value})}
                  placeholder="输入备注信息内容"
                  rows={4}
                />
              </Form.Item>
            )}
          </Form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default BillStyleSettings; 