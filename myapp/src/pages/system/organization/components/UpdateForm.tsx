import {
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ModalForm,
  ProFormRadio,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import React, { useRef } from 'react';
import { FormInstance } from 'antd';

export type FormValueType = {
  id?: string;
  name?: string;
  code?: string;
  parentId?: string;
  sort?: number;
  status?: string;
};

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<boolean>;
  updateModalVisible: boolean;
  values: Partial<API.OrganizationListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const formRef = useRef<FormInstance>();
  
  return (
    <ModalForm
      title={props.values.id ? '编辑机构' : '新建机构'}
      width="600px"
      visible={props.updateModalVisible}
      formRef={formRef}
      onVisibleChange={(visible) => {
        if (!visible) {
          formRef.current?.resetFields();
          if (!props.values.id) {
            props.onCancel();
          }
        }
      }}
      onFinish={async (values) => {
        await props.onSubmit(values);
        formRef.current?.resetFields();
        return true;
      }}
      modalProps={{
        onCancel: () => {
          formRef.current?.resetFields();
          props.onCancel();
        },
        destroyOnClose: true,
      }}
    >
      {props.values.id && (
        <ProFormText
          name="id"
          label="机构ID"
          disabled
          initialValue={props.values.id}
          rules={[
            {
              required: true,
              message: '机构ID为必填项',
            },
          ]}
        />
      )}
      <ProFormText
        name="name"
        label="机构名称"
        initialValue={props.values.name}
        rules={[
          {
            required: true,
            message: '机构名称为必填项',
          },
        ]}
      />
      <ProFormText
        name="code"
        label="机构代码"
        initialValue={props.values.code}
        rules={[
          {
            required: true,
            message: '机构代码为必填项',
          },
          {
            pattern: /^[a-zA-Z0-9]+$/,
            message: '机构代码只能包含英文字母和数字',
          },
        ]}
        placeholder="请输入英文字母和数字"
      />
      <ProFormSelect
        name="parentId"
        label="上级机构"
        initialValue={props.values.parentId}
        request={async () => [
          { label: '总部', value: '0' },
          { label: '北京分公司', value: '1' },
          { label: '上海分公司', value: '2' },
          { label: '广州分公司', value: '3' },
        ]}
        placeholder="请选择上级机构"
      />
      <ProFormDigit
        name="sort"
        label="排序"
        initialValue={props.values.sort || 0}
        min={0}
        max={999}
        rules={[
          {
            required: true,
            message: '排序为必填项',
          },
        ]}
      />
      <ProFormRadio.Group
        name="status"
        label="状态"
        initialValue={props.values.status || '1'}
        options={[
          {
            label: '启用',
            value: '1',
          },
          {
            label: '禁用',
            value: '0',
          },
        ]}
      />
    </ModalForm>
  );
};

export default UpdateForm; 