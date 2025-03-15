import {
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProForm,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import React from 'react';

export type FormValueType = {
  id?: string;
  name?: string;
  code?: string;
  description?: string;
  sort?: number;
  status?: string;
  organizations?: string[];
};

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  values: Partial<API.RoleListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  return (
    <ProForm
      onFinish={props.onSubmit}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '取消',
        },
        onReset: () => props.onCancel(),
      }}
      initialValues={props.values}
    >
      <ProFormText
        name="name"
        label="角色名称"
        rules={[
          {
            required: true,
            message: '角色名称为必填项',
          },
        ]}
      />
      <ProFormText
        name="code"
        label="角色编码"
        rules={[
          {
            required: true,
            message: '角色编码为必填项',
          },
          {
            pattern: /^[a-zA-Z0-9]+$/,
            message: '角色编码只能包含英文字母和数字',
          },
        ]}
        placeholder="请输入英文字母和数字"
      />
      <ProFormSelect
        name="organizations"
        label="适用机构"
        mode="multiple"
        request={async () => [
          { label: '总部', value: 'HQ' },
          { label: '北京分公司', value: 'BJ' },
          { label: '上海分公司', value: 'SH' },
          { label: '广州分公司', value: 'GZ' },
        ]}
        placeholder="请选择适用于该角色的机构"
        rules={[
          {
            required: true,
            message: '至少选择一个适用机构',
          },
        ]}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入角色描述"
      />
      <ProFormDigit
        name="sort"
        label="排序"
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
    </ProForm>
  );
};

export default UpdateForm; 