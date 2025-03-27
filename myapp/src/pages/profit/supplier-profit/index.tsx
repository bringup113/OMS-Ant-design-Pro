import { CheckOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Tag, Space, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from '@umijs/max';
import { getSupplierProfits, updateSupplierProfitSettlementStatus } from './service';
import type { SupplierProfitItem } from './typing';

const SupplierProfitList: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<SupplierProfitItem[]>([]);
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
          await updateSupplierProfitSettlementStatus(ids, status);
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

  const columns: ProColumns<SupplierProfitItem>[] = [
    {
      title: <FormattedMessage id="pages.profit.supplier.id" defaultMessage="ID" />,
      dataIndex: 'id',
      valueType: 'text',
      width: 80,
    },
    {
      title: <FormattedMessage id="pages.profit.supplier.name" defaultMessage="供应商名称" />,
      dataIndex: 'supplierName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.profit.product.name" defaultMessage="产品名称" />,
      dataIndex: 'productName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="pages.profit.isAgentOrder" defaultMessage="代理订单" />,
      dataIndex: 'isAgentOrder',
      valueType: 'select',
      valueEnum: {
        true: {
          text: '是',
          status: 'Success',
        },
        false: {
          text: '否',
          status: 'Default',
        },
      },
      render: (_, record) => (
        <Tag color={record.isAgentOrder ? 'blue' : 'default'}>
          {record.isAgentOrder ? '是' : '否'}
        </Tag>
      ),
      search: true,
    },
    {
      title: <FormattedMessage id="pages.profit.purchasePrice" defaultMessage="采购价格" />,
      dataIndex: 'purchasePrice',
      valueType: 'money',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.profit.salePrice" defaultMessage="销售/代理价格" />,
      dataIndex: 'salePrice',
      valueType: 'money',
      search: false,
      render: (_, record) => {
        const priceTitle = record.isAgentOrder ? '代理价格' : '销售价格';
        try {
          return <Tooltip title={priceTitle}>
            <span>¥{Number(record.salePrice).toFixed(2)}</span>
          </Tooltip>;
        } catch (error) {
          console.error('销售价格数据格式错误:', record.salePrice);
          return <Tooltip title={priceTitle}>
            <span>¥{record.salePrice}</span>
          </Tooltip>;
        }
      }
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
      render: (_, record) => {
        try {
          const rateValue = Number(record.profitRate).toFixed(2);
          return <span>{rateValue}%</span>;
        } catch (error) {
          console.error('利润率数据格式错误:', record.profitRate);
          return <span>{record.profitRate}%</span>;
        }
      }
    },
    {
      title: <FormattedMessage id="pages.profit.commissionRate" defaultMessage="佣金比例" />,
      dataIndex: 'commissionRate',
      valueType: 'percent',
      search: false,
      render: (_, record) => {
        if (record.commissionRate > 0) {
          try {
            return (
              <Tooltip title="利润分佣供应商">
                <span className="text-green-600">{Number(record.commissionRate).toFixed(2)}%</span>
              </Tooltip>
            );
          } catch (error) {
            console.error('佣金比例数据格式错误:', record.commissionRate);
            return (
              <Tooltip title="利润分佣供应商">
                <span className="text-green-600">{record.commissionRate}%</span>
              </Tooltip>
            );
          }
        }
        return '-';
      }
    },
    {
      title: <FormattedMessage id="pages.profit.commission" defaultMessage="佣金金额" />,
      dataIndex: 'commission',
      valueType: 'money',
      search: false,
      render: (_, record) => {
        if (record.commission > 0) {
          try {
            return <span>¥{Number(record.commission).toFixed(2)}</span>;
          } catch (error) {
            console.error('佣金数据格式错误:', record.commission);
            return <span>¥{record.commission}</span>;
          }
        }
        return '-';
      }
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
      <ProTable<SupplierProfitItem>
        headerTitle={intl.formatMessage({
          id: 'pages.profit.supplier.title',
          defaultMessage: '供应商利润',
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
        request={getSupplierProfits}
        columns={columns}
      />
    </PageContainer>
  );
};

export default SupplierProfitList;