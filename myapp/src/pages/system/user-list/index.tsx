import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProList,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, request } from '@umijs/max';
import { Button, Drawer, message, Popconfirm, Tag, Space, Avatar, Typography, Divider, Card } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import UpdateForm from './components/UpdateForm';
// @ts-ignore
import { addUser, removeUser, updateUser, getUsers } from './service';
import './index.less';

const { Text } = Typography;

/**
 * 添加用户
 * @param fields
 */
const handleAdd = async (fields: API.UserListItem, intl: any) => {
  const hide = message.loading(intl.formatMessage({
    id: 'pages.common.loading',
    defaultMessage: '加载中',
  }));
  try {
    await addUser({ ...fields });
    hide();
    message.success(intl.formatMessage({
      id: 'pages.common.success',
      defaultMessage: '成功',
    }));
    return true;
  } catch (error) {
    hide();
    message.error(intl.formatMessage({
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
const handleUpdate = async (fields: API.UserListItem, intl: any) => {
  const hide = message.loading(intl.formatMessage({
    id: 'pages.common.loading',
    defaultMessage: '加载中',
  }));
  try {
    await updateUser(fields);
    hide();
    message.success(intl.formatMessage({
      id: 'pages.common.success',
      defaultMessage: '成功',
    }));
    return true;
  } catch (error) {
    hide();
    message.error(intl.formatMessage({
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
const handleRemove = async (selectedRows: API.UserListItem[], intl: any) => {
  const hide = message.loading(intl.formatMessage({
    id: 'pages.common.loading',
    defaultMessage: '加载中',
  }));
  if (!selectedRows || selectedRows.length === 0) return true;
  try {
    await removeUser({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success(intl.formatMessage({
      id: 'pages.common.success',
      defaultMessage: '成功',
    }));
    return true;
  } catch (error) {
    hide();
    message.error(intl.formatMessage({
      id: 'pages.common.failed',
      defaultMessage: '失败',
    }));
    return false;
  }
};

const UserList: React.FC = () => {
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
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  
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

  // 获取角色文本
  const getRoleText = (role?: string) => {
    if (!role) return '';
    return roles[role]?.text || role;
  };

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
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.name',
        defaultMessage: '昵称',
      }),
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.email',
        defaultMessage: '邮箱',
      }),
      dataIndex: 'email',
      valueType: 'text',
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.organization',
        defaultMessage: '所属机构',
      }),
      dataIndex: 'organization',
      valueType: 'select',
      valueEnum: organizations,
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.role',
        defaultMessage: '角色',
      }),
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: roles,
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
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'pages.userList.createdAt',
        defaultMessage: '创建时间',
      }),
      sorter: true,
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      search: false,
      render: (_, record) => record.createdAt,
    },
    {
      title: <FormattedMessage id="pages.userList.option" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      search: false,
      render: (_, record) => [
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
        <Popconfirm
          key="delete"
          title={intl.formatMessage({
            id: 'pages.userList.delete.confirm',
            defaultMessage: '确定要删除此用户吗？',
          })}
          onConfirm={async () => {
            await handleRemove([record], intl);
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
  ];

  // 处理搜索表单提交
  const handleSearch = (params: Record<string, any>) => {
    setSearchParams(params);
    return params;
  };

  return (
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
              <Button key="reset" onClick={() => formProps.form?.resetFields()}>
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
          onSubmit={handleSearch}
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
          const result = await getUsers({
            ...params,
            ...searchParams,
          });
          
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
                    <Tag color={entity.role === 'admin' ? 'blue' : entity.role === 'auditor' ? 'green' : 'orange'}>
                      {getRoleText(entity.role)}
                    </Tag>
                    <Tag color="purple">{getOrgText(entity.organization)}</Tag>
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
                  })}: {entity.email}
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
                  await handleRemove([entity], intl);
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
              await handleRemove(selectedRowsState, intl);
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
            title={null}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
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
                }, intl);
              } else {
                success = await handleAdd({ ...value } as API.UserListItem, intl);
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
  );
};

export default UserList; 