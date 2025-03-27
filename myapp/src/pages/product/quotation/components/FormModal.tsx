import React, { useState, useEffect } from 'react';
import {
  ModalForm,
  ProForm,
  ProFormDigit,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useAccess, useModel } from '@umijs/max';
import { message, Row, Col, Select } from 'antd';
import { createQuotation, updateQuotation, getSupplierChildren } from '@/services/system/quotation';
import { getProducts } from '@/services/system/product';
import type { QuotationItem, QuotationFormData } from '../typing';
import type { ModalProps } from 'antd';
import type { ProductItem } from '@/pages/product/list/typing';

interface FormModalProps extends Omit<ModalProps, 'visible'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
  values?: QuotationItem;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  values,
  ...modalProps
}) => {
  const intl = useIntl();
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [productOptions, setProductOptions] = useState<{ label: string; value: number }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: number }[]>([]);
  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [supplierLoading, setSupplierLoading] = useState<boolean>(false);

  // 获取产品和供应商数据
  useEffect(() => {
    if (!open) return;

    // 获取产品列表
    const fetchProducts = async () => {
      try {
        setProductLoading(true);
        const response = await getProducts({});
        
        if (response && response.data && Array.isArray(response.data)) {
          const options = response.data.map((item: ProductItem) => ({
            label: `${item.name}${item.country ? ` (${item.country})` : ''}`,
            value: item.id,
          }));
          setProductOptions(options);
        }
      } catch (error) {
        console.error('获取产品列表失败:', error);
        message.error('获取产品列表失败');
      } finally {
        setProductLoading(false);
      }
    };

    // 获取供应商列表（ID为2的供应商的下级）
    const fetchSuppliers = async () => {
      try {
        setSupplierLoading(true);
        const response = await getSupplierChildren(2); // 获取ID为2的供应商的下级
        
        if (response && response.data && Array.isArray(response.data)) {
          // 转换供应商数据为选项格式
          const options = response.data.map((item) => ({
            label: item.name,
            value: item.id,
          }));
          
          // 检查当前编辑的供应商是否已在列表中
          const currentSupplierExists = values?.supplierId && 
            options.some(opt => opt.value === values.supplierId);
          
          // 只有当当前供应商不在列表中时才添加

          
          setSupplierOptions(options);
        }
      } catch (error) {
        console.error('获取供应商列表失败:', error);
        message.error('获取供应商列表失败');
      } finally {
        setSupplierLoading(false);
      }
    };

    fetchProducts();
    fetchSuppliers();
  }, [open, values]);

  const handleSubmit = async (formData: QuotationFormData) => {
    try {
      // 添加日志，查看原始数据
      console.log('原始表单数据:', formData);
      
      // 处理 supplierId，因为使用了 labelInValue
      const processedData = {
        ...formData,
        // 如果 supplierId 是对象，则提取 value 属性
        supplierId: formData.supplierId && typeof formData.supplierId === 'object' 
          ? formData.supplierId.value 
          : formData.supplierId
      };
      
      console.log('处理后的数据:', processedData);
      
      if (values) {
        // 更新报价
        await updateQuotation(values.id, processedData);
        message.success(
          intl.formatMessage({
            id: 'pages.common.update.success',
            defaultMessage: '更新成功',
          }),
        );
      } else {
        // 创建新报价
        const newQuotation = {
          ...processedData,
          isLatest: true,
          createdBy: currentUser?.id, // 添加创建人ID
        };
        console.log('创建的新报价:', newQuotation);
        await createQuotation(newQuotation);
        message.success(
          intl.formatMessage({
            id: 'pages.common.create.success',
            defaultMessage: '创建成功',
          }),
        );
      }
      onSuccess?.();
      return true;
    } catch (error: any) {
      console.error('提交失败:', error);
      
      // 处理重复报价错误
      if (error.response && error.response.status === 409) {
        message.error(error.response.data.message || '该产品和供应商的报价已存在，请使用编辑功能修改');
      } else {
        message.error(
          intl.formatMessage({
            id: 'pages.common.submit.failed',
            defaultMessage: '提交失败',
          }),
        );
      }
      return false;
    }
  };

  return (
    <ModalForm<QuotationFormData>
      {...modalProps}
      title={intl.formatMessage({
        id: values?.id ? 'pages.quotation.edit' : 'pages.quotation.new',
        defaultMessage: values?.id ? '编辑报价' : '新建报价',
      })}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleSubmit}
      initialValues={
        values
          ? {
              productId: values.productId,
              supplierId: values.supplier ? {
                value: values.supplierId,
                label: values.supplier.name
              } : values.supplierId,
              price: values.price,
              agentPrice: values.agentPrice,
              salePrice: values.salePrice,
              status: values.status,
              remark: values.remark,
            }
          : {
              status: 'active',
            }
      }
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onOpenChange?.(false),
        width: 800,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <ProForm.Item
            name="productId"
            label={intl.formatMessage({
              id: 'pages.quotation.product',
              defaultMessage: '产品',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.quotation.product.required',
                  defaultMessage: '请选择产品',
                }),
              },
            ]}
          >
            <Select
              placeholder="请选择产品"
              style={{ width: '100%' }}
              options={productOptions}
              loading={productLoading}
              showSearch
              optionFilterProp="label"
              allowClear
            />
          </ProForm.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <ProForm.Item
            name="supplierId"
            label={intl.formatMessage({
              id: 'pages.quotation.supplier',
              defaultMessage: '供应商',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.quotation.supplier.required',
                  defaultMessage: '请选择供应商',
                }),
              },
            ]}
          >
            <Select
              placeholder="请选择供应商"
              style={{ width: '100%' }}
              options={supplierOptions}
              loading={supplierLoading}
              showSearch
              optionFilterProp="label"
              allowClear
              labelInValue
            />
          </ProForm.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormDigit
            name="price"
            label={intl.formatMessage({
              id: 'pages.quotation.price',
              defaultMessage: '采购价格',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.quotation.price.required',
                  defaultMessage: '请输入价格',
                }),
              },
            ]}
            min={0}
            fieldProps={{ precision: 2 }}
          />
        </Col>
        <Col span={8}>
          <ProFormDigit
            name="agentPrice"
            label={intl.formatMessage({
              id: 'pages.quotation.agentPrice',
              defaultMessage: '代理价格',
            })}
            min={0}
            fieldProps={{ precision: 2 }}
          />
        </Col>
        <Col span={8}>
          <ProFormDigit
            name="salePrice"
            label={intl.formatMessage({
              id: 'pages.quotation.salePrice',
              defaultMessage: '销售价格',
            })}
            min={0}
            fieldProps={{ precision: 2 }}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormRadio.Group
            name="status"
            label={intl.formatMessage({ id: 'pages.quotation.status', defaultMessage: '状态' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'pages.common.status.required', defaultMessage: '请选择状态' }) }]}
            options={[
              { 
                label: intl.formatMessage({ id: 'pages.quotation.status.active', defaultMessage: '生效中' }), 
                value: 'active' 
              },
              { 
                label: intl.formatMessage({ id: 'pages.quotation.status.inactive', defaultMessage: '已失效' }), 
                value: 'inactive' 
              },
            ]}
            initialValue="active"
          />
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={24}>
          <ProFormTextArea
            name="remark"
            label={intl.formatMessage({ id: 'pages.quotation.remark', defaultMessage: '备注' })}
            placeholder={intl.formatMessage({ id: 'pages.quotation.remark.placeholder', defaultMessage: '请输入重要备注信息' })}
            fieldProps={{
              rows: 4,
            }}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default FormModal; 