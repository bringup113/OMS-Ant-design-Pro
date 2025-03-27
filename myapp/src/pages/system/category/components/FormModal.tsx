import React, { useEffect, useState, useRef } from 'react';
import { Modal, Form, message } from 'antd';
import { useIntl, useAccess } from '@umijs/max';
import { ProFormText, ProFormTextArea, ProFormRadio, ProFormSelect } from '@ant-design/pro-components';
import { API } from '../typing.d';
import { useModel } from '@umijs/max';

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  values?: API.ProductCategoryListItem;
  title: string;
  categoryOptions?: any[];
}

const FormModal: React.FC<FormModalProps> = (props) => {
  const { open, onCancel, onSubmit, values, title, categoryOptions } = props;
  const [form] = Form.useForm();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const access = useAccess();
  const isSupplier = access.isSupplier;

  // 初始化表单
  useEffect(() => {
    if (open) {
      // 重置表单
      form.resetFields();
    }
  }, [open, form, isSupplier]);

  // 当values变化时，设置表单值
  useEffect(() => {
    if (open && values) {
      console.log('编辑模式表单值:', values);
      
      // 准备表单数据
      const formData = { ...values };
      delete formData.children;
      
      // 设置表单值
      form.setFieldsValue(formData);
    }
  }, [open, values, form]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const fieldsValue = await form.validateFields();
      console.log('表单数据:', fieldsValue);
      
      // 准备提交数据
      const submitData = { ...fieldsValue };
      
      // 处理父类别ID
      if (submitData.parentId) {
        submitData.parentId = Number(submitData.parentId);
      }
      
      console.log('提交数据:', submitData);
      
      await onSubmit(submitData);
      return true;
    } catch (error) {
      console.error('表单验证失败:', error);
      return false;
    }
  };

  return (
    <Modal
      destroyOnClose
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        name="product_category_form"
        initialValues={{
          status: 'enabled',
        }}
      >
        {/* 父类别选择 */}
        <ProFormSelect
          name="parentId"
          label={intl.formatMessage({
            id: 'pages.productCategory.parent',
            defaultMessage: '父类别',
          })}
          placeholder={intl.formatMessage({
            id: 'pages.productCategory.parent.placeholder',
            defaultMessage: '请选择父类别',
          })}
          options={categoryOptions?.map(item => ({
            label: item.name,
            value: item.id,
          }))}
          fieldProps={{
            allowClear: true,
            showSearch: true,
            optionFilterProp: 'label',
          }}
        />

        {/* 类别名称 */}
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.productCategory.name',
            defaultMessage: '类别名称',
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.productCategory.name.required',
                defaultMessage: '请输入类别名称',
              }),
            },
          ]}
        />

        {/* 类别编码 */}
        <ProFormText
          name="code"
          label={intl.formatMessage({
            id: 'pages.productCategory.code',
            defaultMessage: '类别编码',
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.productCategory.code.required',
                defaultMessage: '请输入类别编码',
              }),
            },
          ]}
        />

        {/* 描述 */}
        <ProFormTextArea
          name="description"
          label={intl.formatMessage({
            id: 'pages.productCategory.description',
            defaultMessage: '描述',
          })}
          placeholder={intl.formatMessage({
            id: 'pages.productCategory.description.placeholder',
            defaultMessage: '请输入描述',
          })}
        />

        {/* 状态 */}
        <ProFormRadio.Group
          name="status"
          label={intl.formatMessage({
            id: 'pages.productCategory.status',
            defaultMessage: '状态',
          })}
          options={[
            {
              label: intl.formatMessage({
                id: 'pages.productCategory.status.enabled',
                defaultMessage: '启用',
              }),
              value: 'enabled',
            },
            {
              label: intl.formatMessage({
                id: 'pages.productCategory.status.disabled',
                defaultMessage: '禁用',
              }),
              value: 'disabled',
            },
          ]}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.productCategory.status.required',
                defaultMessage: '请选择状态',
              }),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default FormModal; 