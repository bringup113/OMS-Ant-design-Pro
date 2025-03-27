import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, message, Modal, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from '@umijs/max';
import { getAgents, deleteAgent } from '@/services/agent';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

export type TableListItem = API.Agent;
export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
};

const AgentList: React.FC = () => {
  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.Agent>();
  const actionRef = useRef<ActionType>();
  const intl = useIntl();

  const columns: ProColumns<API.Agent>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      width: 80,
    },
    {
      title: '代理名称',
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: '联系方式',
      dataIndex: 'contact',
      valueType: 'text',
      copyable: true,
    },
    {
      title: (
        <>
          合作方式
          <Tooltip title="普通贸易：我们给代理固定的代理价格；利润分佣：我们给代理返现利润的百分比">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'cooperationType',
      valueType: 'select',
      valueEnum: {
        none: {
          text: '不分佣',
          status: 'Default',
        },
        regular: {
          text: '普通贸易',
          status: 'Processing',
        },
        commission: {
          text: '利润分佣',
          status: 'Success',
        },
      },
    },
    {
      title: '分佣比例',
      dataIndex: 'commissionRate',
      valueType: 'percent',
      render: (_, record) => {
        if (record.cooperationType === 'commission') {
          return record.commissionRate ? `${record.commissionRate}%` : '未设置';
        }
        return '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: {
          text: '启用',
          status: 'Success',
        },
        inactive: {
          text: '禁用',
          status: 'Error',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            handleUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这个代理吗？',
              onOk: async () => {
                await deleteAgent(record.id);
                message.success('删除成功');
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Agent>
        headerTitle="代理列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async () => {
          const data = await getAgents();
          return {
            data,
            success: true,
            total: data.length,
          };
        }}
        columns={columns}
      />
      <CreateForm
        visible={createModalVisible}
        onVisibleChange={handleCreateModalVisible}
        onSuccess={() => {
          handleCreateModalVisible(false);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
      <UpdateForm
        visible={updateModalVisible}
        current={currentRow}
        onVisibleChange={handleUpdateModalVisible}
        onSuccess={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        }}
      />
    </PageContainer>
  );
};

export default AgentList; 