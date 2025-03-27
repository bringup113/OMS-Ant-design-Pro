import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Radio, message } from 'antd';
import { useIntl, FormattedMessage } from '@umijs/max';
import { ProFormText, ProFormTextArea, ProFormDigit, ProFormRadio, ProFormSelect } from '@ant-design/pro-components';
import { getSuppliers } from '@/services/system/organization';
import type { API } from './typing';

interface UpdateFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  values?: API.ProductCategoryListItem;
  title: string;
  categoryOptions?: any[];
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { open, onCancel, onSubmit, values, title, categoryOptions } = props;
  const [form] = Form.useForm();
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: number }[]>([]);
  const intl = useIntl();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (values) {
        form.setFieldsValue({
          ...values,
          status: values.status || '1',
        });
      }
      fetchSuppliers();
    }
  }, [form, open, values]);

  const fetchSuppliers = async () => {
    try {
      const response = await getSuppliers();
      if (Array.isArray(response)) {
        const options = response.map((supplier) => ({
          label: supplier.name,
          value: supplier.id,
        }));
        setSupplierOptions(options);
      } else {
        message.error('获取供应商列表失败');
      }
    } catch (error) {
      console.error('获取供应商列表出错:', error);
      message.error('获取供应商列表失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const fieldsValue = await form.validateFields();
      await onSubmit(fieldsValue);
      message.success(
        values
          ? intl.formatMessage({ id: 'pages.category.update.success' })
          : intl.formatMessage({ id: 'pages.category.create.success' }),
      );
      onCancel();
    } catch (error) {
      console.error('表单提交错误:', error);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      okText={intl.formatMessage({ id: 'pages.common.confirm' })}
      cancelText={intl.formatMessage({ id: 'pages.common.cancel' })}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <ProFormText
          name="name"
          label={intl.formatMessage({ id: 'pages.category.name' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.category.name.required' }),
            },
          ]}
        />
        <ProFormText
          name="code"
          label={intl.formatMessage({ id: 'pages.category.code' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.category.code.required' }),
            },
          ]}
        />
        <ProFormSelect
          name="supplierId"
          label={intl.formatMessage({ id: 'pages.category.supplier' })}
          options={supplierOptions}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.category.supplier.required' }),
            },
          ]}
        />
        <ProFormSelect
          name="parentId"
          label={intl.formatMessage({ id: 'pages.category.parent' })}
          options={categoryOptions}
        />
        <ProFormDigit
          name="sort"
          label={intl.formatMessage({ id: 'pages.category.sort' })}
          min={0}
          initialValue={0}
        />
        <ProFormRadio.Group
          name="status"
          label={intl.formatMessage({ id: 'pages.category.status' })}
          options={[
            {
              label: intl.formatMessage({ id: 'pages.common.status.enabled' }),
              value: '1',
            },
            {
              label: intl.formatMessage({ id: 'pages.common.status.disabled' }),
              value: '0',
            },
          ]}
          initialValue="1"
        />
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({ id: 'pages.category.description' })}
        />
      </Form>
    </Modal>
  );
};

export default UpdateForm; 