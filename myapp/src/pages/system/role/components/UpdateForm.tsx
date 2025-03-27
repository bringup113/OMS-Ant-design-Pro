import {
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProForm,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useIntl, request } from '@umijs/max';
import React, { useState, useEffect } from 'react';
import { TreeSelect, Form } from 'antd';

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
  const intl = useIntl();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // 设置默认值，如果是新建角色（没有id），则状态默认为启用
  const initialValues = {
    ...props.values,
    status: props.values.id ? props.values.status : '1',
  };
  
  // 获取机构树数据
  useEffect(() => {
    const fetchOrgTree = async () => {
      setLoading(true);
      try {
        const response = await request('/api/organizations', {
          method: 'GET',
        });
        
        if (response && response.data) {
          // 构建树形结构
          const buildTree = (items: any[], parentId: string = '0'): any[] => {
            return items
              .filter(item => item.parentId === parentId)
              .map(item => ({
                title: item.name,
                value: item.code,
                key: item.id,
                children: buildTree(items, item.id),
              }));
          };
          
          setTreeData(buildTree(response.data));
        }
      } catch (error) {
        console.error('获取机构列表失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrgTree();
  }, []);
  
  return (
    <ProForm
      onFinish={props.onSubmit}
      submitter={{
        searchConfig: {
          submitText: intl.formatMessage({ id: 'pages.common.confirm', defaultMessage: '确认' }),
          resetText: intl.formatMessage({ id: 'pages.common.cancel', defaultMessage: '取消' }),
        },
        onReset: () => props.onCancel(),
      }}
      initialValues={initialValues}
    >
      <ProFormText
        name="name"
        label={intl.formatMessage({ id: 'pages.role.name', defaultMessage: '角色名称' })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'pages.role.form.name.required', defaultMessage: '角色名称为必填项' }),
          },
        ]}
      />
      <ProFormText
        name="code"
        label={intl.formatMessage({ id: 'pages.role.code', defaultMessage: '角色编码' })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'pages.role.form.code.required', defaultMessage: '角色编码为必填项' }),
          },
          {
            pattern: /^[a-zA-Z0-9]+$/,
            message: intl.formatMessage({ id: 'pages.role.form.code.pattern', defaultMessage: '角色编码只能包含英文字母和数字' }),
          },
        ]}
        placeholder={intl.formatMessage({ id: 'pages.role.form.code.placeholder', defaultMessage: '请输入英文字母和数字' })}
      />
      
      <Form.Item
        name="organizations"
        label={intl.formatMessage({ id: 'pages.role.organizations', defaultMessage: '适用机构' })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'pages.role.form.organizations.required', defaultMessage: '至少选择一个适用机构' }),
          },
        ]}
      >
        <TreeSelect
          showSearch
          style={{ width: '100%' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          placeholder={intl.formatMessage({ id: 'pages.role.form.organizations.placeholder', defaultMessage: '请选择适用于该角色的机构' })}
          allowClear
          multiple
          treeDefaultExpandAll
          loading={loading}
          treeData={treeData}
        />
      </Form.Item>
      
      <ProFormTextArea
        name="description"
        label={intl.formatMessage({ id: 'pages.role.description', defaultMessage: '描述' })}
        placeholder={intl.formatMessage({ id: 'pages.role.form.description.placeholder', defaultMessage: '请输入角色描述' })}
      />
      <ProFormDigit
        name="sort"
        label={intl.formatMessage({ id: 'pages.role.sort', defaultMessage: '排序' })}
        min={0}
        max={999}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'pages.role.form.sort.required', defaultMessage: '排序为必填项' }),
          },
        ]}
      />
      <ProFormRadio.Group
        name="status"
        label={intl.formatMessage({ id: 'pages.role.status', defaultMessage: '状态' })}
        options={[
          {
            label: intl.formatMessage({ id: 'pages.role.status.enabled', defaultMessage: '启用' }),
            value: '1',
          },
          {
            label: intl.formatMessage({ id: 'pages.role.status.disabled', defaultMessage: '禁用' }),
            value: '0',
          },
        ]}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'pages.role.form.status.required', defaultMessage: '请选择状态' }),
          },
        ]}
      />
    </ProForm>
  );
};

export default UpdateForm; 