import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, App, Popconfirm, Tag, Space } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import UpdateForm from './components/UpdateForm';
import { addOrganization, removeOrganization, updateOrganization, getOrganizations } from '@/services/system/organization';
import dayjs from 'dayjs';

const getCooperationTypeText = (type: string | undefined) => {
  switch (type) {
    case 'no_commission':
      return '不分佣';
    case 'normal_trade':
      return '普通贸易';
    case 'profit_commission':
      return '利润分佣';
    default:
      return '-';
  }
};

const OrganizationList: React.FC = () => {
  const { message, modal } = App.useApp();
  const intl = useIntl();

  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.OrganizationListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.OrganizationListItem[]>([]);
  const [orgTreeData, setOrgTreeData] = useState<any[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 添加机构
   */
  const handleAdd = async (fields: API.FormValueType) => {
    const hide = message.loading('正在添加');
    try {
      await addOrganization(fields);
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
   * 更新机构
   */
  const handleUpdate = async (fields: API.FormValueType & { id: number }) => {
    const hide = message.loading('正在更新');
    try {
      // 确保利润分佣时有佣金比例字段
      if (fields.cooperation_type === 'profit_commission' && fields.commission_rate === undefined) {
        console.log('利润分佣机构，但未包含佣金比例数据，设置默认值');
        fields.commission_rate = 0;
      }
      
      console.log('更新机构请求数据:', fields);
      await updateOrganization(fields.id, fields);
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
   * 删除机构
   */
  const handleRemove = async (selectedRows: API.OrganizationListItem[]) => {
    const hide = message.loading('正在删除');
    
    if (!selectedRows?.length) return true;
    
    try {
      // 检查是否包含受保护的机构
      const protectedOrgs = selectedRows.filter(row => row.id === 1 || row.id === 2);
      if (protectedOrgs.length > 0) {
        hide();
        message.error('无法删除受保护的机构');
        return false;
      }
      
      // 检查是否为供应商机构
      const supplierOrgs = selectedRows.filter(row => row.type === 'supplier');
      if (supplierOrgs.length > 0) {
        // 获取所有机构数据
        const result = await getOrganizations({});
        const allOrgs = result.data || [];
        
        // 检查每个要删除的供应商是否有下属机构
        for (const supplier of supplierOrgs) {
          const hasChildren = allOrgs.some(org => org.parentId === supplier.id);
          if (hasChildren) {
            hide();
            message.error(`供应商"${supplier.name}"还有下属机构，请先删除其下属机构`);
            return false;
          }
        }
      }
      
      // 逐个删除机构，以便更好地处理错误
      for (const row of selectedRows) {
        try {
          await removeOrganization(row.id);
        } catch (error: any) {
          hide();
          console.error('删除机构失败:', error);
          
          // 尝试获取详细的错误信息
          let errorMessage = '删除失败，请重试';
          
          // 检查是否是外键约束错误
          if (error.response?.data?.code === '23503' && 
              error.response?.data?.constraint === 'fk_order_businesses_supplier') {
            errorMessage = `机构"${row.name}"已有关联的订单业务，无法删除`;
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          message.error(errorMessage);
          return false;
        }
      }
      
      hide();
      message.success('删除成功');
      return true;
    } catch (error: any) {
      hide();
      console.error('删除机构失败:', error);
      
      // 尝试获取详细的错误信息
      let errorMessage = '删除失败，请重试';
      
      // 检查是否是外键约束错误
      if (error.response?.data?.code === '23503' && 
          error.response?.data?.constraint === 'fk_order_businesses_supplier') {
        errorMessage = '该机构已有关联的订单业务，无法删除';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
      return false;
    }
  };

  // 获取机构树数据
  useEffect(() => {
    const fetchOrgTree = async () => {
      try {
        const result = await getOrganizations({});
        const responseData = result.data || [];
        
        // 构建树形结构
        const buildTree = (items: API.Organization[], parentId: number | null = null): any[] => {
          return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
              title: item.name,
              value: item.id,
              key: item.id,
              children: buildTree(items, item.id),
            }));
        };
        
        setOrgTreeData(buildTree(responseData));
      } catch (error) {
        console.error('获取机构树数据失败:', error);
        message.error('获取机构树数据失败');
      }
    };
    
    fetchOrgTree();
  }, []);

  // 在数据加载完成后自动展开所有行
  useEffect(() => {
    if (actionRef.current) {
      const fetchAndExpandAll = async () => {
        setLoading(true);
        try {
          const result = await getOrganizations({});
          const responseData = result.data || [];
          
          // 获取所有节点的ID，用于默认展开
          const allKeys = getAllKeys(responseData);
          setExpandedRowKeys(allKeys);
        } catch (error) {
          console.error('获取机构数据失败:', error);
          message.error('获取机构数据失败');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAndExpandAll();
    }
  }, []);

  // 获取所有节点的ID，用于默认展开
  const getAllKeys = (data: API.Organization[]): number[] => {
    let keys: number[] = [];
    data.forEach(item => {
      if (item.id) {
        keys.push(item.id);
      }
    });
    return keys;
  };

  const columns: ProColumns<API.OrganizationListItem>[] = [
    {
      title: intl.formatMessage({ id: 'pages.organization.name', defaultMessage: '机构名称' }),
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
      title: intl.formatMessage({ id: 'pages.organization.code', defaultMessage: '机构编码' }),
      dataIndex: 'code',
      valueType: 'text',
    },
    {
      title: intl.formatMessage({ id: 'pages.organization.type', defaultMessage: '机构类型' }),
      dataIndex: 'type',
      valueType: 'text',
      render: (_, record) => (
        <Tag color={record.type === 'supplier' ? 'blue' : 'green'}>
          {record.type === 'supplier' ? '供应商' : '客户'}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.organization.cooperation_type', defaultMessage: '合作方式' }),
      dataIndex: 'cooperation_type',
      valueType: 'text',
      render: (_, record) => getCooperationTypeText(record.cooperation_type),
    },
    {
      title: intl.formatMessage({ id: 'pages.organization.status', defaultMessage: '状态' }),
      dataIndex: 'status',
      valueType: 'text',
      render: (_, record) => (
        <Tag color={record.status === '1' ? 'success' : 'error'}>
          {record.status === '1' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.organization.created_at', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      render: (_, record) => record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: intl.formatMessage({ id: 'pages.organization.updated_at', defaultMessage: '更新时间' }),
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      render: (_, record) => record.updatedAt ? dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setShowEdit(true);
          }}
        >
          编辑
        </a>,
        record.id !== 1 && record.id !== 2 && (
          <Popconfirm
            key="delete"
            title="确定要删除这个机构吗？"
            onConfirm={async () => {
              const success = await handleRemove([record]);
              if (success) {
                actionRef.current?.reload();
              }
            }}
          >
            <a>删除</a>
          </Popconfirm>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.OrganizationListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.organization.title',
          defaultMessage: '机构列表',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setShowEdit(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getOrganizations(params);
            console.log('获取到的机构数据:', response);
            return {
              data: response.data || [],
              success: true,
              total: response.total || 0,
            };
          } catch (error) {
            console.error('获取机构数据失败:', error);
            message.error('获取机构数据失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as number[]),
        }}
        loading={loading}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              项
            </div>
          }
        >
          <Popconfirm
            title="确定要删除选中的机构吗？"
            onConfirm={async () => {
              const success = await handleRemove(selectedRowsState);
              if (success) {
                setSelectedRows([]);
                actionRef.current?.reload();
              }
            }}
          >
            <Button>批量删除</Button>
          </Popconfirm>
        </FooterToolbar>
      )}
      <UpdateForm
        onSubmit={async (value) => {
          let success;
          if (currentRow?.id) {
            // 确保包含佣金比例字段
            if (value.cooperation_type === 'profit_commission' && value.commission_rate === undefined) {
              console.log('利润分佣，设置默认佣金比例');
              value.commission_rate = 0;
            }
            // 合并ID字段
            const updateData = { ...value, id: currentRow.id };
            console.log('提交更新数据:', updateData);
            success = await handleUpdate(updateData);
          } else {
            success = await handleAdd(value);
          }

          if (success) {
            setShowEdit(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
          return success;
        }}
        onCancel={() => {
          setShowEdit(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={showEdit}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.OrganizationListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.OrganizationListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default OrganizationList; 