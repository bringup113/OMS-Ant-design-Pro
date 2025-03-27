import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProForm,
  ProFormRadio,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, request } from '@umijs/max';
import React, { useEffect, useState, useRef } from 'react';
import { Upload, Button, message, Typography, Spin, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

export type FormValueType = {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  organization?: string;
  status?: string;
  avatar?: string;
  profile?: string;
  dataScope?: string;
};

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  values: Partial<any>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  
  // 头像预览和上传处理
  const [avatarUrl, setAvatarUrl] = React.useState<string>(props.values.avatar || '');
  // 当前选择的机构
  const [selectedOrg, setSelectedOrg] = useState<string>(props.values.organization || '');
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  
  // 创建表单引用
  const formRef = useRef<any>();
  
  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      // 获取上传后的URL
      setAvatarUrl(info.file.response.url);
      message.success(intl.formatMessage({
        id: 'pages.userList.avatar.uploadSuccess',
        defaultMessage: '头像上传成功',
      }));
    } else if (info.file.status === 'error') {
      message.error(intl.formatMessage({
        id: 'pages.userList.avatar.uploadFailed',
        defaultMessage: '头像上传失败',
      }));
    }
  };
  
  // 使用真实的上传API
  const customRequest = (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);
    
    request('/api/upload', {
      method: 'POST',
      data: formData,
    })
      .then(response => {
        if (response && response.url) {
          onSuccess({ url: response.url }, new XMLHttpRequest());
        } else {
          onError(new Error('上传失败'));
        }
      })
      .catch(error => {
        console.error('上传失败:', error);
        onError(error);
      });
  };
  
  return (
    <ProForm
      formRef={formRef}
      submitter={{
        searchConfig: {
          submitText: intl.formatMessage({
            id: 'pages.userList.form.submit',
            defaultMessage: '提交',
          }),
          resetText: intl.formatMessage({
            id: 'pages.userList.form.cancel',
            defaultMessage: '取消',
          }),
        },
        onReset: () => props.onCancel(),
      }}
      onFinish={(values) => {
        // 确保头像URL被包含在提交的数据中
        return props.onSubmit({
          ...values,
          avatar: avatarUrl,
        });
      }}
    >
      <ProFormText
        name="username"
        label={intl.formatMessage({
          id: 'pages.userList.username',
          defaultMessage: '用户名',
        })}
        initialValue={props.values.username}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.userList.username.required"
                defaultMessage="用户名为必填项"
              />
            ),
          },
          {
            pattern: /^[a-zA-Z0-9_]+$/,
            message: intl.formatMessage({
              id: 'pages.userList.username.pattern',
              defaultMessage: '用户名只能包含英文字母、数字和下划线',
            }),
          },
        ]}
        placeholder={intl.formatMessage({
          id: 'pages.userList.username.placeholder',
          defaultMessage: '请输入英文字母、数字和下划线',
        })}
      />
      <ProFormText
        name="name"
        label={intl.formatMessage({
          id: 'pages.userList.name',
          defaultMessage: '昵称',
        })}
        initialValue={props.values.name}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.userList.name.required"
                defaultMessage="昵称为必填项"
              />
            ),
          },
        ]}
      />
      
      <ProForm.Item
        name="avatar"
        label={intl.formatMessage({
          id: 'pages.userList.avatar',
          defaultMessage: '头像',
        })}
        tooltip={intl.formatMessage({
          id: 'pages.userList.avatar.tooltip',
          defaultMessage: '点击按钮上传头像',
        })}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {avatarUrl && (
            <div style={{ marginRight: '16px' }}>
              <img 
                src={avatarUrl} 
                alt={intl.formatMessage({
                  id: 'pages.userList.avatar.preview',
                  defaultMessage: '头像预览',
                })} 
                style={{ width: '80px', height: '80px', borderRadius: '50%' }} 
              />
            </div>
          )}
          <div>
            <Upload
              showUploadList={false}
              customRequest={customRequest}
              onChange={handleAvatarChange}
            >
              <Button icon={<UploadOutlined />}>
                {intl.formatMessage({
                  id: 'pages.userList.avatar.upload',
                  defaultMessage: '上传头像',
                })}
              </Button>
            </Upload>
          </div>
        </div>
      </ProForm.Item>
      
      <ProFormText
        name="email"
        label={intl.formatMessage({
          id: 'pages.userList.email',
          defaultMessage: '邮箱',
        })}
        initialValue={props.values.email}
        rules={[
          {
            type: 'email',
            message: (
              <FormattedMessage
                id="pages.userList.email.invalid"
                defaultMessage="邮箱格式不正确"
              />
            ),
          },
        ]}
        placeholder={intl.formatMessage({
          id: 'pages.userList.email.placeholder',
          defaultMessage: '请输入邮箱（选填）',
        })}
      />
      <ProFormTreeSelect
        name="organization"
        label={intl.formatMessage({
          id: 'pages.userList.organization',
          defaultMessage: '所属机构',
        })}
        initialValue={props.values.organization}
        fieldProps={{
          onChange: (value) => setSelectedOrg(value as string),
          filterTreeNode: true,
          showSearch: true,
          popupMatchSelectWidth: false,
          autoClearSearchValue: true,
          treeNodeFilterProp: 'title',
          fieldNames: {
            label: 'title',
            value: 'value',
          },
        }}
        request={async () => {
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
              
              return buildTree(response.data);
            }
            return [];
          } catch (error) {
            console.error('获取机构列表失败:', error);
            return [];
          }
        }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.userList.organization.required"
                defaultMessage="所属机构为必填项"
              />
            ),
          },
        ]}
      />
      
      <Divider orientation="left">
        {intl.formatMessage({
          id: 'pages.userList.dataScope.title',
          defaultMessage: '数据权限设置',
        })}
      </Divider>
      
      <ProFormRadio.Group
        name="dataScope"
        label={intl.formatMessage({
          id: 'pages.userList.dataScope',
          defaultMessage: '数据权限',
        })}
        initialValue={props.values.dataScope || 'all'}
        options={[
          {
            label: intl.formatMessage({
              id: 'pages.userList.dataScope.all',
              defaultMessage: '全部数据',
            }),
            value: 'all',
          },
          {
            label: intl.formatMessage({
              id: 'pages.userList.dataScope.org',
              defaultMessage: '本机构数据',
            }),
            value: 'org',
          },
          {
            label: intl.formatMessage({
              id: 'pages.userList.dataScope.orgAndChild',
              defaultMessage: '本机构及下级机构数据',
            }),
            value: 'orgAndChild',
          },
          {
            label: intl.formatMessage({
              id: 'pages.userList.dataScope.self',
              defaultMessage: '仅本人数据',
            }),
            value: 'self',
          },
        ]}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: 'pages.userList.dataScope.required',
              defaultMessage: '请选择数据权限范围',
            }),
          },
        ]}
        help={intl.formatMessage({
          id: 'pages.userList.dataScope.help',
          defaultMessage: '设置该用户可以查看的数据范围，独立于角色的权限设置',
        })}
      />
      
      <ProFormTextArea
        name="profile"
        label={intl.formatMessage({
          id: 'pages.userList.profile',
          defaultMessage: '个人简介',
        })}
        initialValue={props.values.profile}
        placeholder={intl.formatMessage({
          id: 'pages.userList.profile.placeholder',
          defaultMessage: '请输入个人简介',
        })}
        fieldProps={{
          rows: 4,
        }}
      />
      <ProFormRadio.Group
        name="status"
        label={intl.formatMessage({
          id: 'pages.userList.status',
          defaultMessage: '状态',
        })}
        initialValue={props.values.status || '1'}
        options={[
          {
            label: intl.formatMessage({
              id: 'pages.userList.status.enabled',
              defaultMessage: '启用',
            }),
            value: '1',
          },
          {
            label: intl.formatMessage({
              id: 'pages.userList.status.disabled',
              defaultMessage: '禁用',
            }),
            value: '0',
          },
        ]}
      />
    </ProForm>
  );
};

export default UpdateForm; 