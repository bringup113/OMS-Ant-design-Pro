import React, { useState, useEffect } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormDatePicker,
  ProFormRadio,
  ProFormTextArea,
  ProList,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import { useRequest, history } from '@umijs/max';
import { Form, Row, Col, Button, Card, message, DatePicker, Divider, Space, Input, Modal, Tag, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { request } from '@umijs/max';

// 自定义ID生成函数
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface BusinessDataType {
  id: string;
  _tempId?: string;
  productId: number;
  supplierId: number;
  costPrice: number;
  agentPrice?: number;
  salePrice: number;
  status: string;
  remark?: string;
  [key: string]: any; // 允许索引签名以支持动态属性
}

interface ProductOption {
  label: string;
  value: number;
  productId: number;
  supplierId: number;
  productName: string;
  supplierName: string;
  country?: string;
  price: number;
  agentPrice?: number;
  salePrice: number;
}

interface OrderFormProps {
  initialValues?: any;
  closeModal: () => void;
  onSuccess: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  initialValues,
  closeModal,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [customerOptions, setCustomerOptions] = useState<{label: string, value: number}[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [businessDataSource, setBusinessDataSource] = useState<BusinessDataType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessDataType | null>(null);
  const [hasAgent, setHasAgent] = useState<boolean>(false);
  const [agentOptions, setAgentOptions] = useState<{label: string, value: number}[]>([]);

  // 获取客户选项
  const { loading: customerLoading } = useRequest(async () => {
    const response = await request('/api/customers');
    if (response.success && response.data) {
      const options = response.data.map((item: any) => ({
        label: `${item.name} (${item.passportNo})`,
        value: item.id,
      }));
      setCustomerOptions(options);
    }
  }, { manual: false });

  // 获取代理选项
  const { loading: agentLoading } = useRequest(async () => {
    try {
      const response = await request('/api/agents');
      // 后端直接返回代理数组
      if (response && Array.isArray(response)) {
        // 仅处理API返回的代理数据，不添加"无代理"选项
        const options = response.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        
        setAgentOptions(options);
      } else {
        setAgentOptions([]);
      }
    } catch (error) {
      console.error('获取代理列表失败:', error);
      setAgentOptions([]);
    }
  }, { manual: false });

  // 从响应对象获取ID的辅助函数
  const getIdValue = (obj: any, possibleKeys: string[]): number | null => {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return Number(obj[key]);
      }
    }
    return null;
  };

  // 获取产品选项
  const { loading: productLoading } = useRequest(async () => {
    try {
      // 获取最新报价数据
      const response = await request('/api/product/quotations', {
        params: { is_latest: true, pageSize: 1000 }
      });
      
      if (!response.success || !response.data) {
        message.error('获取报价产品列表失败');
        return;
      }
      
      const quotations = response.data;
      
      // 提取产品和供应商ID
      const productIds = new Set();
      const supplierIds = new Set();
      
      quotations.forEach((quotation: any) => {
        const productId = getIdValue(quotation, ['productId', 'product_id', 'ProductId', 'PRODUCT_ID']);
        const supplierId = getIdValue(quotation, ['supplierId', 'supplier_id', 'SupplierId', 'SUPPLIER_ID']);
        
        if (productId) productIds.add(productId);
        if (supplierId) supplierIds.add(supplierId);
      });
      
      // 获取产品和供应商详情
      const [productsResponse, suppliersResponse] = await Promise.all([
        request('/api/product/items', {
          params: { ids: Array.from(productIds).join(',') }
        }),
        request('/api/organizations/suppliers', {
          params: { ids: Array.from(supplierIds).join(',') }
        })
      ]);
      
      if (!productsResponse.success || !suppliersResponse.success) {
        message.error('获取产品或供应商详细信息失败');
        return;
      }
      
      // 创建映射
      const productsMap = new Map();
      productsResponse.data.forEach((product: any) => {
        const productId = getIdValue(product, ['id', 'product_id', 'productId', 'ProductId']);
        if (productId) productsMap.set(productId, product);
      });
      
      const suppliersMap = new Map();
      suppliersResponse.data.forEach((supplier: any) => {
        const supplierId = getIdValue(supplier, ['id', 'supplier_id', 'supplierId', 'SupplierId']);
        if (supplierId) suppliersMap.set(supplierId, supplier);
      });
      
      // 创建产品选项
      const options = quotations.map((quotation: any) => {
        const productId = getIdValue(quotation, ['productId', 'product_id', 'ProductId', 'PRODUCT_ID']);
        const supplierId = getIdValue(quotation, ['supplierId', 'supplier_id', 'SupplierId', 'SUPPLIER_ID']);
        
        const product = productsMap.get(productId);
        const supplier = suppliersMap.get(supplierId);
        
        if (product && supplier) {
          const costPrice = Number(quotation.price || quotation.cost_price || 0);
          const agentPrice = Number(quotation.agentPrice || quotation.agent_price || 0);
          const salePrice = Number(quotation.salePrice || quotation.sale_price || 0);
          
          return {
            label: `${product.name} (${supplier.name})`,
            value: productId,
            quotationId: Number(quotation.id),
            productId: productId,
            supplierId: supplierId,
            productName: product.name || '',
            supplierName: supplier.name || '',
            country: product.country || '',
            price: costPrice,
            agentPrice: agentPrice,
            salePrice: salePrice,
          };
        }
        return null;
      }).filter(Boolean);
      
      setProductOptions(options);
    } catch (error) {
      console.error('获取产品列表失败:', error);
      message.error('获取产品列表失败，请检查API连接');
    }
  }, { manual: false });

  // 处理选择客户
  const handleCustomerChange = async (value: number) => {
    if (!value) {
      setCustomerInfo(null);
      return;
    }

    try {
      const response = await request(`/api/customers/${value}`);
      if (response.success && response.data) {
        const customer = response.data;
        setCustomerInfo(customer);
        
        // 自动填充护照相关信息
        form.setFieldsValue({
          passportNo: customer.passportNo,
          name: customer.name,
          gender: customer.gender,
          birthDate: customer.birthDate ? dayjs(customer.birthDate) : null,
          country: customer.country || '柬埔寨', // 使用国家名称
          passportIssueDate: customer.issueDate ? dayjs(customer.issueDate) : null,
          passportExpiryDate: customer.expiryDate ? dayjs(customer.expiryDate) : null,
          passportValidityPeriod: customer.issueDate && customer.expiryDate ? 
            [dayjs(customer.issueDate), dayjs(customer.expiryDate)] : null,
        });
      }
    } catch (error) {
      console.error('获取客户信息失败:', error);
    }
  };

  // 处理选择代理
  const handleAgentChange = (value: number) => {
    setHasAgent(!!value); // 如果value存在则设置hasAgent为true
    
    // 如果没有选择代理，清空所有业务的代理金额
    if (!value && businessDataSource.length > 0) {
      const updatedBusinessData = businessDataSource.map(item => ({
        ...item,
        agentPrice: undefined
      }));
      setBusinessDataSource(updatedBusinessData);
    }
  };

  // 处理编辑业务
  const handleEditBusiness = (row: BusinessDataType) => {
    setEditingBusiness(row);
    setModalVisible(true);
  };

  // 处理删除业务
  const handleDeleteBusiness = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条业务信息吗？',
      onOk: () => {
        setBusinessDataSource(businessDataSource.filter(item => item.id !== id));
        message.success('删除成功');
      },
    });
  };

  // 处理添加/更新业务
  const handleBusinessFormSubmit = async (values: any) => {
    try {
      // 验证必填字段
      const requiredFields = ['productId', 'supplierId', 'costPrice', 'salePrice'];
      for (const field of requiredFields) {
        if (!values[field]) {
          message.error(`请填写${field === 'productId' ? '产品' : 
                          field === 'supplierId' ? '供应商' : 
                          field === 'costPrice' ? '成本价' : '销售价'}`);
          return;
        }
      }
      
      // 确保状态字段有值
      if (!values.status) {
        values.status = 'pending';
      }
      
      // 转换数值字段
      const numericFields = ['costPrice', 'salePrice', 'agentPrice'];
      numericFields.forEach(field => {
        if (values[field] !== undefined) {
          values[field] = Number(values[field]);
        }
      });
      
      // 如果没有代理，删除代理价格字段
      if (!hasAgent && values.agentPrice) {
        delete values.agentPrice;
      }
      
      // 获取选择的产品选项
      const selectedProduct = productOptions.find(product => product.value === values.value);
      
      // 生成唯一的临时ID
      const tempId = `business-${Date.now()}`;
      
      // 增加产品名称和临时ID，确保使用正确的产品ID
      const businessEntry = {
        ...values,
        productId: selectedProduct ? selectedProduct.productId : values.productId, // 确保使用正确的产品ID
        productName: selectedProduct?.label || '',
        _tempId: tempId,
      };
      
      // 检查是否正在编辑现有条目
      if (editingBusiness?.id) {
        // 更新现有条目
        const index = businessDataSource.findIndex((item) => item.id === editingBusiness.id);
        if (index > -1) {
          const newBusinessDataSource = [...businessDataSource];
          newBusinessDataSource[index] = {
            ...businessEntry,
            id: editingBusiness.id,
            _tempId: editingBusiness._tempId || tempId,
          };
          setBusinessDataSource(newBusinessDataSource);
          message.success('业务信息已更新');
        }
      } else {
        // 添加新条目
        setBusinessDataSource([
          ...businessDataSource,
          {
            ...businessEntry,
            id: tempId, // 设置id等于临时ID，用于前端列表
          },
        ]);
        message.success('业务信息已添加');
      }
      
      // 关闭模态窗口并重置数据
      setModalVisible(false);
      setEditingBusiness(null);
      modalForm.resetFields();
      
      // 计算总金额
      setTimeout(() => {
        calculateTotalAmount();
      }, 0);
    } catch (error: any) {
      console.error('处理业务表单时出错:', error);
      message.error('处理业务表单时出错: ' + (error.message || '未知错误'));
    }
  };

  // 计算订单总金额
  const calculateTotalAmount = () => {
    if (businessDataSource.length === 0) return 0;
    return businessDataSource.reduce((sum, item) => {
      const salePrice = typeof item.salePrice === 'number' ? item.salePrice : Number(item.salePrice) || 0;
      return sum + salePrice;
    }, 0);
  };

  // 计算成本总金额
  const calculateTotalCostAmount = () => {
    if (businessDataSource.length === 0) return 0;
    return businessDataSource.reduce((sum, item) => {
      const costPrice = typeof item.costPrice === 'number' ? item.costPrice : Number(item.costPrice) || 0;
      return sum + costPrice;
    }, 0);
  };
  
  // 计算代理总金额
  const calculateTotalAgentAmount = () => {
    if (businessDataSource.length === 0) return 0;
    return businessDataSource.reduce((sum, item) => {
      const agentPrice = typeof item.agentPrice === 'number' ? item.agentPrice : Number(item.agentPrice) || 0;
      return sum + agentPrice;
    }, 0);
  };

  // 订单总金额变化时更新表单中的总金额
  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    const totalCostAmount = calculateTotalCostAmount();
    const totalAgentAmount = calculateTotalAgentAmount();
    form.setFieldsValue({ 
      totalAmount,
      totalCostAmount,
      ...(hasAgent ? { totalAgentAmount } : {})
    });
  }, [businessDataSource, hasAgent]);

  // 修改初始化钩子
  useEffect(() => {
    if (initialValues) {
      console.log('OrderForm组件接收到初始值:', initialValues);
      
      // 设置代理状态
      setHasAgent(!!initialValues.agentId);
      
      // 处理业务数据
      if (initialValues.businessDataSource && Array.isArray(initialValues.businessDataSource)) {
        console.log('准备设置业务数据源:', initialValues.businessDataSource);
        
        // 确保所有业务数据有有效ID
        const validBusinessData = initialValues.businessDataSource.map((item: any) => {
          if (!item.id) {
            return { ...item, id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
          }
          return item;
        });
        
        setBusinessDataSource(validBusinessData);
        console.log('业务数据源设置完成');
      } else {
        console.log('订单没有业务数据或业务数据格式不正确');
        setBusinessDataSource([]);
      }
      
      // 如果有客户数据，设置客户信息
      if (initialValues.customer) {
        console.log('设置客户信息:', initialValues.customer);
        setCustomerInfo(initialValues.customer);
      }
      
      try {
        // 设置表单初始值
        console.log('设置表单字段值');
        form.setFieldsValue({
          ...initialValues,
          birthDate: initialValues.birthDate ? dayjs(initialValues.birthDate) : null,
          passportIssueDate: initialValues.passportIssueDate ? dayjs(initialValues.passportIssueDate) : null,
          passportExpiryDate: initialValues.passportExpiryDate ? dayjs(initialValues.passportExpiryDate) : null,
          passportValidityPeriod: initialValues.passportIssueDate && initialValues.passportExpiryDate 
            ? [dayjs(initialValues.passportIssueDate), dayjs(initialValues.passportExpiryDate)] 
            : null,
        });
        console.log('表单字段设置完成');
      } catch (error) {
        console.error('设置表单字段时出错:', error);
      }
    }
  }, [initialValues, form]);

  // 提交订单表单
  const handleSubmit = async (values: any) => {
    try {
      // 验证业务数据源
      if (businessDataSource.length === 0) {
        message.error('请至少添加一项业务数据');
        return;
      }

      // 构建请求体
      const orderData: any = {
        customerId: Number(form.getFieldValue('customerId')),
        totalAmount: calculateTotalAmount(),
        paymentStatus: form.getFieldValue('paymentStatus') || 'unpaid',
        accountStatus: form.getFieldValue('accountStatus') || 'unbilled',
        ...(form.getFieldValue('agentId') ? { agentId: Number(form.getFieldValue('agentId')) } : {}),
        ...(form.getFieldValue('remark') ? { remark: form.getFieldValue('remark') } : {}),
        businesses: businessDataSource.map(business => {
          // 创建一个新的对象，不包含id字段，除非它是有效的数据库ID
          const businessData: any = {
            productId: Number(business.productId),
            supplierId: Number(business.supplierId),
            costPrice: Number(business.costPrice),
            ...(business.agentPrice ? { agentPrice: Number(business.agentPrice) } : {}),
            salePrice: Number(business.salePrice),
            status: business.status || 'pending',
            ...(business.remark ? { remark: business.remark } : {}),
          };
          
          // 仅当ID不是前端生成的临时ID时，才添加ID字段
          if (business.id && !business.id.toString().startsWith('temp-') && !business.id.toString().startsWith('business-')) {
            businessData.id = Number(business.id);
          }
          
          return businessData;
        }),
      };
      
      // 如果没有指定客户ID，则添加客户信息创建新客户
      if (!orderData.customerId) {
        orderData.customer = {
          name: form.getFieldValue('name'),
          passportNo: form.getFieldValue('passportNo'),
          gender: form.getFieldValue('gender'),
          country: form.getFieldValue('country'),
          birthDate: form.getFieldValue('birthDate')?.format('YYYY-MM-DD'),
          issueDate: form.getFieldValue('passportIssueDate')?.format('YYYY-MM-DD') || 
                    (form.getFieldValue('passportValidityPeriod')?.[0]?.format('YYYY-MM-DD')),
          expiryDate: form.getFieldValue('passportExpiryDate')?.format('YYYY-MM-DD') || 
                     (form.getFieldValue('passportValidityPeriod')?.[1]?.format('YYYY-MM-DD')),
        };
      }
      
      console.log('提交的订单数据:', orderData);
      console.log('提交的JSON字符串:', JSON.stringify(orderData));
      
      // 确定是新建订单还是更新订单
      const isUpdating = !!initialValues?.id;
      const url = isUpdating ? `/api/orders/${initialValues.id}` : '/api/orders';
      const method = isUpdating ? 'PUT' : 'POST';
      
      console.log(`操作类型: ${isUpdating ? '更新' : '新建'}, 请求方法: ${method}, URL: ${url}`);
      
      // 使用fetch API提交订单数据
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      const responseText = await response.text();
      console.log('服务器响应文本:', responseText);
      
      let responseData;
      
      try {
        // 尝试解析响应为JSON
        responseData = JSON.parse(responseText);
        console.log('服务器响应数据:', responseData);
      } catch (e) {
        // 如果不是有效的JSON，使用原始文本
        console.error('解析响应JSON失败:', e);
        responseData = { message: responseText };
      }

      // 检查响应状态
      if (!response.ok) {
        message.error(responseData?.message || `订单${isUpdating ? '更新' : '创建'}失败`);
        return;
      }

      message.success(`订单${isUpdating ? '更新' : '创建'}成功`);
      
      // 检查closeModal是否是函数
      if (typeof closeModal === 'function') {
        closeModal();
      } else {
        // 如果不是函数，则使用路由导航返回订单列表页
        history.push('/order/order-list');
      }
      
      // 如果onSuccess是函数，则调用
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error: any) {
      console.error('处理订单提交时出错:', error);
      message.error(`处理订单提交时出错: ${error.message || '未知错误'}`);
    }
  };

  // 选择产品时自动填充相关信息
  const handleProductSelect = (value: number) => {
    if (!value) return;
    
    const selectedQuotation = productOptions.find(item => item.value === value);
    
    if (selectedQuotation) {
      // 创建要设置的表单值
      const formValues: any = {
        productId: selectedQuotation.productId, // 确保使用实际的产品ID
        supplierId: selectedQuotation.supplierId,
        costPrice: selectedQuotation.price || 0,
        salePrice: selectedQuotation.salePrice || 0,
      };
      
      // 仅当有代理时，才设置代理金额
      if (hasAgent) {
        formValues.agentPrice = selectedQuotation.agentPrice || 0;
      }
      
      modalForm.setFieldsValue(formValues);
      message.success('已自动填充报价信息');
    } else {
      message.warning('未找到该产品的报价信息');
    }
  };

  // 订单状态选项
  const statusOptions = [
    { label: '待处理', value: 'pending' },
    { label: '处理中', value: 'processing' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' },
  ];

  return (
    <PageContainer
      title="新建订单"
      onBack={() => history.push('/order/order-list')}
      breadcrumb={{
        routes: [
          { path: '/order', breadcrumbName: '订单管理' },
          { path: '/order/order-list', breadcrumbName: '订单列表' },
          { path: '', breadcrumbName: '新建订单' },
        ],
      }}
    >
      <ProForm
        form={form}
        onFinish={handleSubmit}
        initialValues={initialValues}
        submitter={false}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card 
              title="订单信息" 
              variant="borderless"
              extra={
                <Space>
                  <Button onClick={() => history.push('/order/order-list')}>取消</Button>
                  <Button type="primary" onClick={() => form.submit()}>提交</Button>
                </Space>
              }
              style={{ height: '100%' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <ProFormSelect
                    name="customerId"
                    label="选择客户"
                    options={customerOptions}
                    fieldProps={{
                      showSearch: true,
                      filterOption: (input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                      onChange: handleCustomerChange,
                      allowClear: true,
                      size: "middle",
                      style: { width: '100%' },
                    }}
                    placeholder="请选择客户"
                  />
                </Col>
                <Col span={12}>
                  <ProFormText
                    name="name"
                    label="客户姓名"
                    placeholder="请输入客户姓名"
                    rules={[{ required: true, message: '请输入客户姓名' }]}
                    fieldProps={{
                      size: "middle",
                      style: { width: '100%' },
                    }}
                  />
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={6}>
                  <ProFormText
                    name="passportNo"
                    label="护照号码"
                    placeholder="请输入护照号码"
                    rules={[{ required: true, message: '请输入护照号码' }]}
                    fieldProps={{
                      size: "middle",
                      style: { width: '100%' },
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormDatePicker
                    name="birthDate"
                    label="出生日期"
                    placeholder="请选择出生日期"
                    fieldProps={{
                      size: "middle",
                      style: { width: '100%' },
                    }}
                  />
                </Col>
                <Col span={5}>
                  <ProFormRadio.Group
                    name="gender"
                    label="性别"
                    options={[
                      { label: '男', value: 'male' },
                      { label: '女', value: 'female' },
                    ]}
                    rules={[{ required: true, message: '请选择性别' }]}
                    fieldProps={{
                      size: "middle",
                    }}
                  />
                </Col>
                <Col span={7}>
                  <ProFormText
                    name="country"
                    label="国家"
                    placeholder="请输入国家"
                    rules={[{ required: true, message: '请输入国家' }]}
                    fieldProps={{
                      size: "middle",
                      style: { width: '100%' },
                    }}
                  />
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <ProForm.Item
                    name="passportValidityPeriod"
                    label="护照有效期"
                  >
                    <DatePicker.RangePicker 
                      style={{ width: '100%' }} 
                      placeholder={['签发日期', '到期日期']}
                      size="middle"
                      onChange={(dates) => {
                        if (dates) {
                          form.setFieldsValue({
                            passportIssueDate: dates[0],
                            passportExpiryDate: dates[1]
                          });
                        } else {
                          form.setFieldsValue({
                            passportIssueDate: null,
                            passportExpiryDate: null
                          });
                        }
                      }}
                    />
                  </ProForm.Item>
                  
                  {/* 隐藏字段，用于存储护照签发日期和到期日期 */}
                  <ProForm.Item name="passportIssueDate" hidden><Input /></ProForm.Item>
                  <ProForm.Item name="passportExpiryDate" hidden><Input /></ProForm.Item>
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    name="agentId"
                    label="代理"
                    placeholder="请选择代理"
                    options={agentOptions}
                    fieldProps={{
                      onChange: handleAgentChange,
                      size: "middle",
                      style: { width: '100%' },
                      loading: agentLoading
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    name="accountStatus"
                    label="账单状态"
                    placeholder="账单状态"
                    options={[
                      { label: '未生成账单', value: 'unbilled' },
                      { label: '已生成账单', value: 'billed' },
                    ]}
                    initialValue="unbilled"
                    rules={[{ required: true, message: '请选择账单状态' }]}
                    disabled
                    fieldProps={{
                      size: "middle",
                      style: { width: '100%' },
                    }}
                  />
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={6}>
                  <ProFormSelect
                    name="paymentStatus"
                    label="收款状态"
                    placeholder="请选择收款状态"
                    options={[
                      { label: '未支付', value: 'unpaid' },
                      { label: '部分支付', value: 'partial' },
                      { label: '已支付', value: 'paid' },
                    ]}
                    initialValue="unpaid"
                    rules={[{ required: true, message: '请选择收款状态' }]}
                    fieldProps={{
                      size: "middle",
                      style: { width: '100%' },
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormDigit
                    name="totalAmount"
                    label="订单总金额"
                    placeholder="请输入订单总金额"
                    min={0}
                    fieldProps={{ 
                      precision: 2,
                      size: "middle",
                      style: { width: '100%' },
                    }}
                    rules={[{ required: true, message: '请输入订单总金额' }]}
                    disabled
                  />
                </Col>
                <Col span={6}>
                  <ProFormDigit
                    name="totalCostAmount"
                    label="成本总金额"
                    min={0}
                    fieldProps={{ 
                      precision: 2,
                      size: "middle",
                      style: { width: '100%' },
                    }}
                    disabled
                  />
                </Col>
                <Col span={6}>
                  {hasAgent && (
                    <ProFormDigit
                      name="totalAgentAmount"
                      label="代理总金额"
                      min={0}
                      fieldProps={{ 
                        precision: 2,
                        size: "middle",
                        style: { width: '100%' },
                      }}
                      disabled
                    />
                  )}
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={24}>
                  <ProFormTextArea
                    name="remark"
                    label="备注"
                    placeholder="请输入备注信息"
                    fieldProps={{
                      size: "middle",
                      rows: 2,
                      style: { width: '100%' },
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card 
              title="业务信息" 
              variant="borderless"
              extra={
                <Button type="primary" onClick={() => {
                  setEditingBusiness(null);
                  modalForm.resetFields();
                  setModalVisible(true);
                }}>
                  <PlusOutlined /> 添加业务信息
                </Button>
              }
              style={{ height: '100%' }}
            >
              <ProList<BusinessDataType>
                rowKey="id"
                headerTitle="业务明细"
                dataSource={businessDataSource}
                showActions="hover"
                toolBarRender={() => [
                  <div key="total">
                    <span style={{ marginRight: 8 }}>
                      总成本: ${businessDataSource.length > 0 
                        ? Number(businessDataSource.reduce((sum, item) => 
                            sum + (typeof item.costPrice === 'number' ? item.costPrice : Number(item.costPrice) || 0), 0)).toFixed(2) 
                        : '0.00'}
                    </span>
                    {hasAgent && 
                      <span style={{ marginRight: 8 }}>
                        总代理费: ${businessDataSource.length > 0 
                          ? Number(businessDataSource.reduce((sum, item) => 
                              sum + (typeof item.agentPrice === 'number' ? item.agentPrice : Number(item.agentPrice) || 0), 0)).toFixed(2) 
                          : '0.00'}
                      </span>
                    }
                    <span>
                      总销售额: ${businessDataSource.length > 0 
                        ? Number(businessDataSource.reduce((sum, item) => 
                            sum + (typeof item.salePrice === 'number' ? item.salePrice : Number(item.salePrice) || 0), 0)).toFixed(2) 
                        : '0.00'}
                    </span>
                  </div>
                ]}
                locale={{
                  emptyText: (
                    <div style={{ textAlign: 'center', padding: 32 }}>
                      <p>暂无业务信息数据</p>
                      <Button type="primary" onClick={() => {
                        setEditingBusiness(null);
                        modalForm.resetFields();
                        setModalVisible(true);
                      }}>
                        <PlusOutlined /> 添加业务信息
                      </Button>
                    </div>
                  )
                }}
                metas={{
                  title: {
                    dataIndex: 'productId',
                    title: '产品',
                    render: (_, row) => {
                      const quotation = productOptions.find(item => item.productId === row.productId);
                      return quotation ? <span><b>{quotation.productName}</b></span> : '未知产品';
                    },
                  },
                  description: {
                    dataIndex: 'productId',
                    title: '产品详情',
                    render: (_, row) => {
                      const quotation = productOptions.find(item => item.productId === row.productId);
                      return quotation ? 
                        `供应商: ${quotation.supplierName || '未知'}${quotation.country ? `, 国家: ${quotation.country}` : ''}` : 
                        '无详情';
                    },
                  },
                  content: {
                    render: (_, row) => (
                      <div>
                        <p>
                          成本金额: ${row.costPrice} | 
                          {hasAgent && row.agentPrice !== undefined && `代理金额: $${row.agentPrice} | `}
                          销售金额: ${row.salePrice}
                        </p>
                        {row.remark && <p>备注: {row.remark}</p>}
                      </div>
                    ),
                  },
                  subTitle: {
                    render: (_, row) => {
                      const statusMap = {
                        pending: { color: 'default', text: '待处理' },
                        processing: { color: 'processing', text: '处理中' },
                        completed: { color: 'success', text: '已完成' },
                        cancelled: { color: 'error', text: '已取消' },
                      };
                      const status = statusMap[row.status as keyof typeof statusMap] || { color: 'default', text: '未知状态' };
                      return <Tag color={status.color}>{status.text}</Tag>;
                    },
                  },
                  actions: {
                    render: (_, row) => [
                      <a key="edit" onClick={() => handleEditBusiness(row)}>
                        <EditOutlined /> 编辑
                      </a>,
                      <a key="delete" onClick={() => handleDeleteBusiness(row.id)}>
                        <DeleteOutlined /> 删除
                      </a>,
                    ],
                  },
                }}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          title={editingBusiness ? "编辑业务信息" : "添加业务信息"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingBusiness(null);
            modalForm.resetFields();
          }}
          footer={null}
          destroyOnClose
          width={600}
        >
          <Form
            form={modalForm}
            name="businessForm"
            layout="vertical"
            initialValues={editingBusiness || {
              status: 'pending',
              costPrice: 0,
              salePrice: 0
            }}
            onFinish={handleBusinessFormSubmit}
          >
            <Form.Item
              name="productId"
              label="产品"
              rules={[{ required: true, message: '请选择产品' }]}
            >
              <Select
                options={productOptions}
                showSearch
                placeholder="请选择产品"
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                onChange={handleProductSelect}
                loading={productLoading}
              />
            </Form.Item>
            
            <Form.Item
              name="supplierId"
              label="供应商"
              rules={[{ required: true, message: '请选择供应商' }]}
            >
              <Input disabled />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="costPrice"
                  label="成本价"
                  rules={[{ required: true, message: '请填写成本价' }]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: '100%' }}
                    placeholder="请输入成本价"
                  />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                {hasAgent && (
                  <Form.Item
                    name="agentPrice"
                    label="代理价"
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: '100%' }}
                      placeholder="请输入代理价"
                    />
                  </Form.Item>
                )}
              </Col>
              
              <Col span={8}>
                <Form.Item
                  name="salePrice"
                  label="销售价"
                  rules={[{ required: true, message: '请填写销售价' }]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: '100%' }}
                    placeholder="请输入销售价"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select
                options={[
                  { label: '待处理', value: 'pending' },
                  { label: '处理中', value: 'processing' },
                  { label: '已完成', value: 'completed' },
                  { label: '已取消', value: 'cancelled' },
                ]}
              />
            </Form.Item>
            
            <Form.Item
              name="remark"
              label="备注"
            >
              <Input.TextArea
                rows={2}
                placeholder="请输入备注"
              />
            </Form.Item>
            
            <Form.Item>
              <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    setEditingBusiness(null);
                    modalForm.resetFields();
                  }}
                >
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  确定
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </ProForm>
    </PageContainer>
  );
};

export default OrderForm; 