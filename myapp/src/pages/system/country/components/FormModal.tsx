import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import { useIntl } from '@umijs/max';
import { ProFormText, ProFormRadio } from '@ant-design/pro-components';
import { API } from '../typing';

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  values?: API.CountryListItem;
  title: string;
}

const FormModal: React.FC<FormModalProps> = (props) => {
  const { open, onCancel, onSubmit, values, title } = props;
  const [form] = Form.useForm();
  const intl = useIntl();

  // 初始化表单
  useEffect(() => {
    if (open) {
      // 重置表单
      form.resetFields();
    }
  }, [open, form]);

  // 当values变化时，设置表单值
  useEffect(() => {
    if (open && values) {
      console.log('编辑模式表单值:', values);
      form.setFieldsValue(values);
    }
  }, [open, values, form]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const fieldsValue = await form.validateFields();
      console.log('表单数据:', fieldsValue);
      await onSubmit(fieldsValue);
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
        name="country_form"
        initialValues={{
          status: 'enabled',
        }}
      >
        {/* 国家名称 */}
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.country.name',
            defaultMessage: '国家名称',
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.country.name.required',
                defaultMessage: '请输入国家名称',
              }),
            },
          ]}
        />

        {/* 英文名称 */}
        <ProFormText
          name="englishName"
          label={intl.formatMessage({
            id: 'pages.country.englishName',
            defaultMessage: '英文名称',
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'pages.country.englishName.required',
                defaultMessage: '请输入英文名称',
              }),
            },
          ]}
        />

        {/* 状态 */}
        <ProFormRadio.Group
          name="status"
          label={intl.formatMessage({
            id: 'pages.country.status',
            defaultMessage: '状态',
          })}
          options={[
            {
              label: intl.formatMessage({
                id: 'pages.common.status.enabled',
                defaultMessage: '启用',
              }),
              value: 'enabled',
            },
            {
              label: intl.formatMessage({
                id: 'pages.common.status.disabled',
                defaultMessage: '禁用',
              }),
              value: 'disabled',
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default FormModal; 