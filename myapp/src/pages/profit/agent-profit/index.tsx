import { CheckOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Tag, Space } from 'antd';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from '@umijs/max';
import { getAgentProfits, updateAgentProfitSettlementStatus } from './service';
import type { AgentProfitItem } from './typing';

const AgentProfitList: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<AgentProfitItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType>();
  const intl = useIntl();

  // 处理结算状态更新
  const handleUpdateSettlementStatus = async (ids: number[], status: 'settled' | 'unsettled') => {
    Modal.confirm({
      title: status === 'settled' ? '确认标记为已结算' : '确认标记为未结算',
      content: `确定要将选中的${ids.length}条记录标记为${status === 'settled' ? '已结算' : '未结算'}吗？`,
      onOk: async () => {
        try {
          await updateAgentProfitSettlementStatus(ids, status);
          message.success('更新成功');
          actionRef.current?.reload();
          setSelectedRows([]);
          setSelectedRowKeys([]);
        } catch (error) {
          console.error('更新结算状态失败:', error);
          message.error('更新失败');
        }
      },
    });
  };

  const columns: ProColumns<AgentProfitItem>[] = [
    {
      title: <FormattedMessage id="pages.profit.agent.id" defaultMessage="ID" />,
      dataIndex: 'id',
      valueType: 'text',
      width: 80,
    },
    {
      title: <FormattedMessage id="pages.profit.agent.name" defaultMessage="代理商名称" />,
      dataIndex: 'agentName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.profit.product.name" defaultMessage="产品名称" />,
      dataIndex: 'productName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.profit.agentPrice" defaultMessage="代理价格" />,
      dataIndex: 'agentPrice',
      valueType: 'money',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.salePrice" defaultMessage="销售价格" />,
      dataIndex: 'salePrice',
      valueType: 'money',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.profit" defaultMessage="利润" />,
      dataIndex: 'profit',
      valueType: 'money',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.profitRate" defaultMessage="利润率" />,
      dataIndex: 'profitRate',
      valueType: 'percent',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.commissionRate" defaultMessage="佣金率" />,
      dataIndex: 'commissionRate',
      valueType: 'percent',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.commission" defaultMessage="佣金" />,
      dataIndex: 'commission',
      valueType: 'money',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.orderCount" defaultMessage="订单数量" />,
      dataIndex: 'orderCount',
      valueType: 'digit',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.period" defaultMessage="统计周期" />,
      dataIndex: 'period',
      valueType: 'dateRange',
      render: (_, record) => `${record.startDate} 至 ${record.endDate}`,
    },
    {
      title: <FormattedMessage id="pages.profit.settlementStatus" defaultMessage="结算状态" />,
      dataIndex: 'settlementStatus',
      valueType: 'select',
      valueEnum: {
        settled: {
          text: '已结算',
          status: 'Success',
        },
        unsettled: {
          text: '未结算',
          status: 'Warning',
        },
      },
      render: (_, record) => (
        <Tag color={record.settlementStatus === 'settled' ? 'green' : 'orange'}>
          {record.settlementStatus === 'settled' ? '已结算' : '未结算'}
        </Tag>
      ),
    },
    {
      title: <FormattedMessage id="pages.common.createTime" defaultMessage="创建时间" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
  ];

  return (
    <PageContainer>
      <ProTable<AgentProfitItem>
        headerTitle={intl.formatMessage({
          id: 'pages.profit.agent.title',
          defaultMessage: '代理商利润',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        rowSelection={{
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRows);
            setSelectedRowKeys(selectedRowKeys);
          },
          selectedRowKeys,
        }}
        toolBarRender={() => [
          selectedRowKeys.length > 0 ? (
            <Space>
              <Button
                type="primary"
                key="settle"
                onClick={() => {
                  const ids = selectedRows.map(row => row.id);
                  handleUpdateSettlementStatus(ids, 'settled');
                }}
              >
                <CheckOutlined /> 标记为已结算
              </Button>
              <Button
                key="unsettled"
                onClick={() => {
                  const ids = selectedRows.map(row => row.id);
                  handleUpdateSettlementStatus(ids, 'unsettled');
                }}
              >
                标记为未结算
              </Button>
            </Space>
          ) : null,
        ]}
        request={getAgentProfits}
        columns={columns}
      />
    </PageContainer>
  );
};

export default AgentProfitList;