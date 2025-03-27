import React, { useState, useEffect } from 'react';
import {
  ModalForm,
  ProForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useAccess } from '@umijs/max';
import { message, Row, Col, Select, TreeSelect, Input } from 'antd';
import { createProduct, updateProduct } from '@/services/system/product';
import { getEnabledProductCategoryTreeSelect } from '@/services/system/product-category';
import { getCountries } from '@/pages/system/country/service';
import type { ProductItem, ProductFormData } from '../typing';
import type { ModalProps } from 'antd';
import type { API } from '@/pages/system/country/typing';

interface FormModalProps extends Omit<ModalProps, 'visible'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
  values?: ProductItem;
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
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: number }[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [countryLoading, setCountryLoading] = useState<boolean>(false);

  // 获取产品类别
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getEnabledProductCategoryTreeSelect();
        console.log('获取已启用产品类别树(TreeSelect格式):', response);
        
        if (response && response.data && Array.isArray(response.data)) {
          setCategoryOptions(response.data);
        }
      } catch (error) {
        console.error('获取产品类别树失败:', error);
        message.error('获取产品类别失败');
      } finally {
        setLoading(false);
      }
    };

    // 获取国家列表
    const fetchCountries = async () => {
      try {
        setCountryLoading(true);
        const response = await getCountries({});
        console.log('获取国家列表:', response);
        
        if (response && response.data && Array.isArray(response.data)) {
          const options = response.data.map((item: API.CountryListItem) => ({
            label: item.name,
            value: item.name,
          }));
          setCountryOptions(options);
        }
      } catch (error) {
        console.error('获取国家列表失败:', error);
        message.error('获取国家列表失败');
      } finally {
        setCountryLoading(false);
      }
    };

    if (open) {
      fetchCategories();
      fetchCountries();
    }
  }, [open]);

  // 获取初始值
  const getInitialValues = () => {
    const initialValues: any = { ...values };
    console.log('表单初始值:', initialValues);
    return initialValues;
  };

  const handleSubmit = async (formData: any) => {
    try {
      console.log('提交表单数据:', formData);
      
      const submitData: ProductFormData = {
        name: formData.name.trim(),
        categoryId: Number(formData.categoryId),
        description: formData.description?.trim(),
        country: formData.country,
        status: 'online',
      };

      if (values?.id) {
        await updateProduct(values.id, submitData);
        message.success('更新成功');
      } else {
        await createProduct(submitData);
        message.success('创建成功');
      }
      onSuccess();
      return true;
    } catch (error: any) {
      console.error('提交失败:', error);
      message.error('操作失败: ' + (error.response?.data?.message || error.message || '未知错误'));
      return false;
    }
  };

  return (
    <ModalForm<ProductFormData>
      {...modalProps}
      title={intl.formatMessage({
        id: values?.id ? 'pages.product.edit' : 'pages.product.new',
        defaultMessage: values?.id ? '编辑产品' : '新建产品',
      })}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleSubmit}
      initialValues={getInitialValues()}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onOpenChange?.(false),
        width: 800,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <ProForm.Item
            name="country"
            label={intl.formatMessage({
              id: 'pages.product.country',
              defaultMessage: '国家',
            })}
          >
            <Select
              placeholder="请选择国家"
              style={{ width: '100%' }}
              options={countryOptions}
              loading={countryLoading}
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
            name="categoryId"
            label={intl.formatMessage({
              id: 'pages.product.category',
              defaultMessage: '产品类别',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.product.category.required',
                  defaultMessage: '请选择产品类别',
                }),
              },
            ]}
          >
            <TreeSelect
              placeholder="请选择产品类别"
              style={{ width: '100%' }}
              treeData={categoryOptions}
              loading={loading}
              showSearch
              treeNodeFilterProp="label"
              allowClear
              treeLine
              treeDefaultExpandAll
            />
          </ProForm.Item>
        </Col>
      </Row>

      <ProForm.Item
        name="name"
        label={intl.formatMessage({
          id: 'pages.product.name',
          defaultMessage: '产品名称',
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.product.name.required',
              defaultMessage: '请输入产品名称',
            }),
          },
        ]}
      >
        <Input placeholder="请输入产品名称" />
      </ProForm.Item>

      <ProFormTextArea
        name="description"
        label={intl.formatMessage({
          id: 'pages.product.description',
          defaultMessage: '产品描述',
        })}
        placeholder="请输入产品描述"
      />
    </ModalForm>
  );
};

export default FormModal; 