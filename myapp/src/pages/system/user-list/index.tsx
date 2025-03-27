import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProList,
  ProTable,
  ModalForm,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, request } from '@umijs/max';
import { Button, Drawer, Popconfirm, Tag, Space, Avatar, Typography, Divider, Card, App } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import UpdateForm from './components/UpdateForm';
// @ts-ignore
import { addUser, removeUser, updateUser, getUsers, resetUserPassword } from './service';
import './index.less';

const { Text } = Typography;

const UserList: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const intl = useIntl();

  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.UserListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.UserListItem[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [activeKey, setActiveKey] = useState<string>('all');
  
  // 存储角色和机构数据
  const [roles, setRoles] = useState<Record<string, { text: string }>>({});
  const [organizations, setOrganizations] = useState<Record<string, { text: string }>>({});

  /**
   * 添加用户
   * @param fields
   */
  const handleAdd = async (fields: API.UserListItem) => {
    const hide = messageApi.loading(intl.formatMessage({
      id: 'pages.common.loading',
      defaultMessage: '加载中',
    }));
    try {
      await addUser({ ...fields });
      hide();
      messageApi.success(intl.formatMessage({
        id: 'pages.common.success',
        defaultMessage: '成功',
      }));
      return true;
    } catch (error) {
      hide();
      messageApi.error(intl.formatMessage({
        id: 'pages.common.failed',
        defaultMessage: '失败',
      }));
      return false;
    }
  };

  /**
   * 更新用户
   * @param fields
   */
  const handleUpdate = async (fields: API.UserListItem) => {
    const hide = messageApi.loading(intl.formatMessage({
      id: 'pages.common.loading',
      defaultMessage: '加载中',
    }));
    try {
      await updateUser(fields);
      hide();
      messageApi.success(intl.formatMessage({
        id: 'pages.common.success',
        defaultMessage: '成功',
      }));
      return true;
    } catch (error) {
      hide();
      messageApi.error(intl.formatMessage({
        id: 'pages.common.failed',
        defaultMessage: '失败',
      }));
      return false;
    }
  };

  /**
   * 删除用户
   * @param selectedRows
   */
  const handleRemove = async (selectedRows: API.UserListItem[]) => {
    const hide = messageApi.loading(intl.formatMessage({
      id: 'pages.common.loading',
      defaultMessage: '加载中',
    }));
    if (!selectedRows || selectedRows.length === 0) return true;
    try {
      await removeUser({
        key: selectedRows.map((row) => row.key),
      });
      hide();
      messageApi.success(intl.formatMessage({
        id: 'pages.common.success',
        defaultMessage: '成功',
      }));
      return true;
    } catch (error) {
      hide();
      messageApi.error(intl.formatMessage({
        id: 'pages.common.failed',
        defaultMessage: '失败',
      }));
      return false;
    }
  };

  /**
   * 重置用户密码
   * @param userId
   * @param newPassword
   */
  const handleResetPassword = async (userId: string, newPassword: string) => {
    const hide = messageApi.loading(intl.formatMessage({
      id: 'pages.userList.resetPassword.loading',
      defaultMessage: '正在重置密码...',
    }));
    try {
      await resetUserPassword(userId, newPassword);
      hide();
      messageApi.success(intl.formatMessage({
        id: 'pages.userList.resetPassword.success',
        defaultMessage: '密码重置成功！',
      }));
      return true;
    } catch (error) {
      hide();
      messageApi.error(intl.formatMessage({
        id: 'pages.userList.resetPassword.failed',
        defaultMessage: '密码重置失败，请重试',
      }));
      return false;
    }
  };

  // 获取角色和机构数据
  useEffect(() => {
    // 获取角色列表
    const fetchRoles = async () => {
      try {
        const response = await request('/api/roles', {
          method: 'GET',
        });
        
        if (response && response.data) {
          const roleEnum = response.data.reduce((acc: Record<string, { text: string }>, role: any) => {
            if (role.code) {
              acc[role.code.toLowerCase()] = { text: role.name };
            }
            return acc;
          }, {});
          setRoles(roleEnum);
        }
      } catch (error) {
        console.error('获取角色列表失败:', error);
      }
    };
    
    // 获取机构列表
    const fetchOrganizations = async () => {
      try {
        const response = await request('/api/organizations', {
          method: 'GET',
        });
        
        if (response && response.data) {
          const orgEnum = response.data.reduce((acc: Record<string, { text: string }>, org: any) => {
            if (org.code) {
              acc[org.code] = { text: org.name };
            }
            return acc;
          }, {});
          setOrganizations(orgEnum);
        }
      } catch (error) {
        console.error('获取机构列表失败:', error);
      }
    };
    
    fetchRoles();
    fetchOrganizations();
  }, []);

  // 获取机构文本
  const getOrgText = (org?: string) => {
    if (!org) return '';
    return organizations[org]?.text || org;
  };

  const columns: ProColumns<API.UserListItem>[] = [
    {
      title: intl.formatMessage({
        id: 'pages.userList.avatar',
        defaultMessage: '头像',
      }),
      dataIndex: 'avatar',
      valueType: 'avatar',
      width: 80,
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.username',
        defaultMessage: '用户名',
      }),
      dataIndex: 'username',
      valueType: 'text',
      fieldProps: {
        placeholder: intl.formatMessage({
          id: 'pages.userList.username.placeholder',
          defaultMessage: '请输入用户名',
        }),
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.name',
        defaultMessage: '昵称',
      }),
      dataIndex: 'name',
      valueType: 'text',
      fieldProps: {
        placeholder: intl.formatMessage({
          id: 'pages.userList.name.placeholder',
          defaultMessage: '请输入昵称',
        }),
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.email',
        defaultMessage: '邮箱',
      }),
      dataIndex: 'email',
      valueType: 'text',
      fieldProps: {
        placeholder: intl.formatMessage({
          id: 'pages.userList.email.placeholder',
          defaultMessage: '请输入邮箱',
        }),
      },
      renderText: (val: string) => val || '-',
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.organization',
        defaultMessage: '所属机构',
      }),
      dataIndex: 'organization',
      valueType: 'select',
      valueEnum: organizations,
      fieldProps: {
        placeholder: intl.formatMessage({
          id: 'pages.userList.organization.placeholder',
          defaultMessage: '请选择机构',
        }),
        showSearch: true,
        filterOption: (input: string, option: any) => 
          option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.dataScope',
        defaultMessage: '数据权限范围',
      }),
      dataIndex: 'dataScope',
      valueType: 'select',
      valueEnum: {
        'all': { 
          text: intl.formatMessage({
            id: 'pages.userList.dataScope.all',
            defaultMessage: '全部数据',
          }), 
          status: 'success' 
        },
        'org': { 
          text: intl.formatMessage({
            id: 'pages.userList.dataScope.org',
            defaultMessage: '本机构数据',
          }), 
          status: 'processing' 
        },
        'orgAndChild': { 
          text: intl.formatMessage({
            id: 'pages.userList.dataScope.orgAndChild',
            defaultMessage: '本机构及下级机构数据',
          }), 
          status: 'processing' 
        },
        'self': { 
          text: intl.formatMessage({
            id: 'pages.userList.dataScope.self',
            defaultMessage: '仅本人数据',
          }), 
          status: 'default' 
        },
      },
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.profile',
        defaultMessage: '个人简介',
      }),
      dataIndex: 'profile',
      valueType: 'text',
      ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.status',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      hideInForm: true,
      valueType: 'select',
      valueEnum: {
        '0': {
          text: intl.formatMessage({
            id: 'pages.userList.status.disabled',
            defaultMessage: '禁用',
          }),
          status: 'error',
        },
        '1': {
          text: intl.formatMessage({
            id: 'pages.userList.status.enabled',
            defaultMessage: '启用',
          }),
          status: 'success',
        },
      },
      fieldProps: {
        placeholder: intl.formatMessage({
          id: 'pages.userList.status.placeholder',
          defaultMessage: '请选择状态',
        }),
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.createdAt',
        defaultMessage: '创建时间',
      }),
      sorter: true,
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            startTime: value?.[0],
            endTime: value?.[1],
          };
        },
      },
      render: (_, record) => record.createdAt,
    },
    {
      title: <FormattedMessage id="pages.userList.option" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      search: false,
      render: (_, record) => {
        // admin用户（ID为1）不可编辑和删除
        if (record.id === '1') {
          return [
            <span key="protected" style={{ color: 'rgba(0,0,0,0.45)' }}>
              <FormattedMessage id="pages.userList.protected" defaultMessage="受保护" />
            </span>
          ];
        }
        
        // 其他用户可以编辑、重置密码和删除
        return [
          <a
            key="config"
            onClick={() => {
              setCurrentRow(record);
              setIsEditing(true);
              setShowDetail(true);
            }}
          >
            <FormattedMessage id="pages.userList.edit" defaultMessage="编辑" />
          </a>,
          <Divider type="vertical" key="divider1" />,
          <ModalForm
            key="resetPassword"
            title={intl.formatMessage({
              id: 'pages.userList.resetPassword',
              defaultMessage: '重置密码',
            })}
            trigger={
              <a>
                {intl.formatMessage({
                  id: 'pages.userList.resetPassword',
                  defaultMessage: '重置密码',
                })}
              </a>
            }
            onFinish={async (values) => {
              if (record.id) {
                const success = await handleResetPassword(record.id, values.newPassword);
                if (success) {
                  return true;
                }
                return false;
              }
              return false;
            }}
            modalProps={{
              destroyOnClose: true,
            }}
          >
            <ProFormText.Password
              name="newPassword"
              label={intl.formatMessage({
                id: 'pages.userList.resetPassword.newPassword',
                defaultMessage: '新密码',
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.userList.resetPassword.newPassword.required',
                    defaultMessage: '请输入新密码',
                  }),
                },
                {
                  min: 6,
                  message: intl.formatMessage({
                    id: 'pages.userList.resetPassword.newPassword.length',
                    defaultMessage: '密码长度至少为6位',
                  }),
                },
              ]}
            />
            <ProFormText.Password
              name="confirmPassword"
              label={intl.formatMessage({
                id: 'pages.userList.resetPassword.confirmPassword',
                defaultMessage: '确认新密码',
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.userList.resetPassword.confirmPassword.required',
                    defaultMessage: '请确认新密码',
                  }),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(intl.formatMessage({
                      id: 'pages.userList.resetPassword.confirmPassword.notMatch',
                      defaultMessage: '两次输入的密码不一致',
                    })));
                  },
                }),
              ]}
            />
          </ModalForm>,
          <Divider type="vertical" key="divider2" />,
          <Popconfirm
            key="delete"
            title={intl.formatMessage({
              id: 'pages.userList.delete.confirm',
              defaultMessage: '确定要删除此用户吗？',
            })}
            onConfirm={async () => {
              await handleRemove([record]);
              actionRef.current?.reload();
            }}
            okText={intl.formatMessage({
              id: 'pages.common.confirm',
              defaultMessage: '确定',
            })}
            cancelText={intl.formatMessage({
              id: 'pages.common.cancel',
              defaultMessage: '取消',
            })}
          >
            <a key="delete" style={{ color: 'red' }}>
              {intl.formatMessage({
                id: 'pages.userList.delete',
                defaultMessage: '删除',
              })}
            </a>
          </Popconfirm>,
        ];
      },
    },
  ];

  return (
    <App>
      <PageContainer>
        <Card 
          style={{ marginBottom: 16, padding: 0 }} 
          bodyStyle={{ padding: 0 }}
          className="search-card"
          bordered={false}
        >
          <ProTable<API.UserListItem>
            search={{
              labelWidth: 120,
              defaultCollapsed: true,
              span: 8,
              className: 'custom-query-filter',
              optionRender: (searchConfig, formProps, dom) => [
                <Button key="submit" type="primary" onClick={() => formProps.form?.submit()}>
                  {intl.formatMessage({
                    id: 'pages.common.search',
                    defaultMessage: '查询',
                  })}
                </Button>,
                <Button key="reset" onClick={() => {
                  formProps.form?.resetFields();
                  setSearchParams({});
                  actionRef.current?.reload();
                }}>
                  {intl.formatMessage({
                    id: 'pages.common.reset',
                    defaultMessage: '重置',
                  })}
                </Button>,
              ],
              layout: 'horizontal',
              defaultColsNumber: 3,
            }}
            options={false}
            columns={columns}
            form={{
              syncToUrl: false,
              style: { padding: '12px 12px 0' },
            }}
            onSubmit={(values) => {
              // 处理搜索参数
              const searchValues = { ...values };
              
              // 如果有状态标签页选择，保留状态筛选
              if (activeKey === 'active') {
                searchValues.status = '1';
              } else if (activeKey === 'inactive') {
                searchValues.status = '0';
              }
              
              setSearchParams(searchValues);
              actionRef.current?.reload();
            }}
            pagination={false}
            toolBarRender={false}
            ghost={true}
            cardProps={{
              bodyStyle: { padding: 0 },
            }}
            tableRender={() => {
              return <></>;
            }}
            style={{ minHeight: 'auto' }}
          />
        </Card>

        <ProList<API.UserListItem>
          headerTitle={intl.formatMessage({
            id: 'pages.userList.title',
            defaultMessage: '用户列表',
          })}
          actionRef={actionRef}
          rowKey="key"
          search={false}
          cardProps={{
            bordered: false,
          }}
          toolbar={{
            menu: {
              type: 'tab',
              activeKey: activeKey,
              items: [
                {
                  key: 'all',
                  label: intl.formatMessage({
                    id: 'pages.userList.all',
                    defaultMessage: '全部用户',
                  }),
                },
                {
                  key: 'active',
                  label: intl.formatMessage({
                    id: 'pages.userList.active',
                    defaultMessage: '已启用',
                  }),
                },
                {
                  key: 'inactive',
                  label: intl.formatMessage({
                    id: 'pages.userList.inactive',
                    defaultMessage: '已禁用',
                  }),
                },
              ],
              onChange: (key) => {
                setActiveKey(key as string);
                let newParams = { ...searchParams };
                
                if (key === 'active') {
                  newParams.status = '1';
                } else if (key === 'inactive') {
                  newParams.status = '0';
                } else {
                  delete newParams.status;
                }
                
                setSearchParams(newParams);
                actionRef.current?.reload();
              },
            },
            actions: [
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  setCurrentRow(undefined);
                  setIsEditing(true);
                  setShowDetail(true);
                }}
              >
                <PlusOutlined /> <FormattedMessage id="pages.userList.new" defaultMessage="新建" />
              </Button>,
            ],
          }}
          request={async (params, sort, filter) => {
            // 合并分页参数和搜索参数
            const queryParams = {
              ...params,
              ...searchParams,
            };
            
            console.log('ProList request params:', queryParams);
            
            const result = await getUsers(queryParams);
            
            return {
              data: result.data || [],
              total: result.total || 0,
              success: result.success || false,
            };
          }}
          pagination={{
            pageSize: 10,
          }}
          rowSelection={{
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
          }}
          metas={{
            title: {
              dataIndex: 'name',
              render: (dom, entity) => (
                <div 
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    setCurrentRow(entity);
                    setIsEditing(false);
                    setShowDetail(true);
                  }}
                >
                  <Avatar size="large" src={entity.avatar} />
                  <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{entity.name}</div>
                    <div style={{ fontSize: 14, color: '#666' }}>{entity.username}</div>
                  </div>
                  <div style={{ marginLeft: 16 }}>
                    <Space>
                      <Tag color={entity.status === '1' ? 'success' : 'error'}>
                        {entity.status === '1' ? 
                          intl.formatMessage({
                            id: 'pages.userList.status.enabled',
                            defaultMessage: '启用',
                          }) : 
                          intl.formatMessage({
                            id: 'pages.userList.status.disabled',
                            defaultMessage: '禁用',
                          })
                        }
                      </Tag>
                    </Space>
                  </div>
                </div>
              ),
            },
            description: {
              render: (_, entity) => (
                <Space>
                  <Text type="secondary">
                    {intl.formatMessage({
                      id: 'pages.userList.email.label',
                      defaultMessage: '邮箱',
                    })}: {entity.email || '-'}
                  </Text>
                  <Divider type="vertical" />
                  <Text type="secondary">
                    {intl.formatMessage({
                      id: 'pages.userList.createdAt',
                      defaultMessage: '创建时间',
                    })}: {entity.createdAt}
                  </Text>
                </Space>
              ),
            },
            subTitle: {
              render: () => null,
            },
            actions: {
              render: (_, entity) => [
                <a
                  key="edit"
                  onClick={() => {
                    setCurrentRow(entity);
                    setIsEditing(true);
                    setShowDetail(true);
                  }}
                >
                  {intl.formatMessage({
                    id: 'pages.userList.edit',
                    defaultMessage: '编辑',
                  })}
                </a>,
                <Popconfirm
                  key="delete"
                  title={intl.formatMessage({
                    id: 'pages.userList.delete.confirm',
                    defaultMessage: '确定要删除此用户吗？',
                  })}
                  onConfirm={async () => {
                    await handleRemove([entity]);
                    actionRef.current?.reload();
                  }}
                  okText={intl.formatMessage({
                    id: 'pages.common.confirm',
                    defaultMessage: '确定',
                  })}
                  cancelText={intl.formatMessage({
                    id: 'pages.common.cancel',
                    defaultMessage: '取消',
                  })}
                >
                  <a key="delete" style={{ color: 'red' }}>
                    {intl.formatMessage({
                      id: 'pages.userList.delete',
                      defaultMessage: '删除',
                    })}
                  </a>
                </Popconfirm>,
              ],
            },
          }}
        />

        {selectedRowsState?.length > 0 && (
          <FooterToolbar
            extra={
              <div>
                <FormattedMessage id="pages.userList.chosen" defaultMessage="已选择" />{' '}
                <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
                <FormattedMessage id="pages.userList.item" defaultMessage="项" />
              </div>
            }
          >
            <Button
              onClick={async () => {
                await handleRemove(selectedRowsState);
                setSelectedRows([]);
                actionRef.current?.reload();
              }}
            >
              <FormattedMessage id="pages.userList.batchDelete" defaultMessage="批量删除" />
            </Button>
          </FooterToolbar>
        )}

        <Drawer
          width={600}
          open={showDetail}
          onClose={() => {
            setCurrentRow(undefined);
            setShowDetail(false);
            setIsEditing(false);
          }}
          closable={false}
          title={isEditing ? (currentRow?.id ? 
            intl.formatMessage({
              id: 'pages.userList.edit',
              defaultMessage: '编辑用户',
            }) : 
            intl.formatMessage({
              id: 'pages.userList.new',
              defaultMessage: '新建用户',
            })) : currentRow?.name}
        >
          {!isEditing && currentRow?.name && (
            <ProDescriptions<API.UserListItem>
              column={2}
              title={`${currentRow?.username} 的详细信息`}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.id,
              }}
              styles={{
                content: {}
              }}
              columns={columns.filter(column => column.dataIndex !== 'id') as ProDescriptionsItemProps<API.UserListItem>[]}
            />
          )}
          {isEditing && (
            <UpdateForm
              onSubmit={async (value) => {
                let success;
                if (currentRow?.id) {
                  success = await handleUpdate({ 
                    ...value,
                    id: currentRow.id,
                    key: currentRow.key 
                  });
                } else {
                  success = await handleAdd({ ...value } as API.UserListItem);
                }
                
                if (success) {
                  setShowDetail(false);
                  setIsEditing(false);
                  setCurrentRow(undefined);
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              }}
              onCancel={() => {
                setShowDetail(false);
                setIsEditing(false);
                setCurrentRow(undefined);
              }}
              values={currentRow || {}}
            />
          )}
        </Drawer>
      </PageContainer>
    </App>
  );
};

export default UserList; 