import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message, Popconfirm, Tag, Space, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
import PermissionForm from './components/PermissionForm';
// @ts-ignore
import { addRole, removeRole, updateRole, getRoles } from './service';

/**
 * 添加角色
 * @param fields
 */
const handleAdd = async (fields: API.RoleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRole({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败，请重试');
    return false;
  }
};

/**
 * 更新角色
 * @param fields
 */
const handleUpdate = async (fields: API.RoleListItem) => {
  const hide = message.loading('正在更新');
  try {
    await updateRole(fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败，请重试');
    return false;
  }
};

/**
 * 删除角色
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RoleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRole({
      key: selectedRows.map((row) => row.key as string),
    });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const RoleList: React.FC = () => {
  /**
   * 编辑权限窗口的弹窗
   */
  const [permissionModalVisible, handlePermissionModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RoleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RoleListItem[]>([]);

  /**
   * 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.RoleListItem>[] = [
    
    {
      title: '角色名称',
      dataIndex: 'name',
      valueType: 'text',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      valueType: 'text',
    },
    {
      title: '适用机构',
      dataIndex: 'organizations',
      valueType: 'select',
      valueEnum: {
        'HQ': { text: '总部' },
        'BJ': { text: '北京分公司' },
        'SH': { text: '上海分公司' },
        'GZ': { text: '广州分公司' },
      },
      render: (_, record) => {
        const orgMap: Record<string, string> = {
          'HQ': '总部',
          'BJ': '北京分公司',
          'SH': '上海分公司',
          'GZ': '广州分公司',
        };
        
        if (!record.organizations || record.organizations.length === 0) {
          return '-';
        }
        
        // 如果机构数量超过2个，只显示前2个，其余的显示+N
        if (record.organizations.length > 2) {
          return (
            <div style={{ display: 'flex', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <Tooltip title={record.organizations.map(org => orgMap[org] || org).join(', ')}>
                <div>
                  <Tag color="blue">{orgMap[record.organizations[0]] || record.organizations[0]}</Tag>
                  <Tag color="blue">{orgMap[record.organizations[1]] || record.organizations[1]}</Tag>
                  <Tag color="blue">+{record.organizations.length - 2}</Tag>
                </div>
              </Tooltip>
            </div>
          );
        }
        
        // 如果机构数量不超过2个，全部显示
        return (
          <div style={{ display: 'flex', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <Space size={[0, 4]} wrap={false}>
              {record.organizations.map(org => (
                <Tag key={org} color="blue">{orgMap[org] || org}</Tag>
              ))}
            </Space>
          </div>
        );
      },
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'text',
      ellipsis: true,
    },

    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        '0': {
          text: '禁用',
          status: 'error',
        },
        '1': {
          text: '启用',
          status: 'success',
        },
      },
      width: 80,
      align: 'center',
    },

    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            setCurrentRow(record);
            setIsEditing(true);
            setShowDetail(true);
          }}
        >
          <FormattedMessage id="pages.searchTable.config" defaultMessage="编辑" />
        </a>,
        <a
          key="permission"
          onClick={() => {
            handlePermissionModalVisible(true);
            setCurrentRow(record);
          }}
        >
          编辑权限
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除此角色吗？"
          onConfirm={async () => {
            await handleRemove([record]);
            actionRef.current?.reload();
          }}
          okText="确定"
          cancelText="取消"
        >
          <a key="delete" style={{ color: 'red' }}>
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RoleListItem, API.PageParams>
        headerTitle="角色列表"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setIsEditing(true);
              setShowDetail(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async (params) => {
          const result = await getRoles(params);
          // 确保从API响应中正确提取数据
          const responseData = result.data || [];
          return {
            data: responseData,
            // 从响应中安全地提取total和success属性
            total: (result as any).total || responseData.length,
            success: (result as any).success !== false,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="已选择" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
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
            <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="批量删除" />
          </Button>
        </FooterToolbar>
      )}

      <PermissionForm
        onSubmit={async (value) => {
          const success = await handleUpdate({
            ...currentRow,
            permissions: value.permissions,
          } as API.RoleListItem);

          if (success) {
            handlePermissionModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handlePermissionModalVisible(false);
        }}
        permissionModalVisible={permissionModalVisible}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
          setIsEditing(false);
        }}
        closable={false}
        title={isEditing ? (currentRow?.id ? '编辑角色' : '新建角色') : currentRow?.name}
      >
        {!isEditing && currentRow?.name && (
          <ProDescriptions<API.RoleListItem>
            column={2}
            title={null}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns.filter(column => column.dataIndex !== 'id') as ProDescriptionsItemProps<API.RoleListItem>[]}
          />
        )}
        {isEditing && (
          <UpdateForm
            onSubmit={async (value) => {
              let success;
              if (currentRow?.id) {
                success = await handleUpdate({ ...currentRow, ...value });
              } else {
                success = await handleAdd({ ...value } as API.RoleListItem);
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
              if (!currentRow?.id) {
                setCurrentRow(undefined);
              }
            }}
            values={currentRow || {}}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default RoleList; 