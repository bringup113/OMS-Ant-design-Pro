import React, { useState, useEffect } from 'react';
import { Modal, Table, Spin, Empty, Tag } from 'antd';
import { useIntl } from '@umijs/max';
import type { QuotationItem } from '../typing';
import { getQuotationHistory } from '@/services/system/quotation';

interface HistoryModalProps {
  open: boolean;
  onCancel: () => void;
  productId: number;
  supplierId: number;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  open,
  onCancel,
  productId,
  supplierId,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<QuotationItem[]>([]);

  useEffect(() => {
    if (open && productId && supplierId) {
      fetchHistoryData();
    }
  }, [open, productId, supplierId]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await getQuotationHistory(productId, supplierId);
      if (response && response.data) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error('获取历史报价失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={intl.formatMessage({
        id: 'pages.quotation.history.title',
        defaultMessage: '历史报价记录',
      })}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {historyData.length > 0 ? (
          <Table
            dataSource={historyData}
            columns={[
              {
                title: intl.formatMessage({
                  id: 'pages.quotation.price',
                  defaultMessage: '采购价格',
                }),
                dataIndex: 'price',
                key: 'price',
                render: (text) => text,
              },
              {
                title: intl.formatMessage({
                  id: 'pages.quotation.agentPrice',
                  defaultMessage: '代理价格',
                }),
                dataIndex: 'agentPrice',
                key: 'agentPrice',
                render: (text) => text || '-',
              },
              {
                title: intl.formatMessage({
                  id: 'pages.quotation.salePrice',
                  defaultMessage: '销售价格',
                }),
                dataIndex: 'salePrice',
                key: 'salePrice',
                render: (text) => text || '-',
              },
              {
                title: intl.formatMessage({
                  id: 'pages.quotation.status',
                  defaultMessage: '状态',
                }),
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'active' ? 'green' : 'default'}>
                    {status === 'active'
                      ? intl.formatMessage({
                          id: 'pages.quotation.status.active',
                          defaultMessage: '生效中',
                        })
                      : intl.formatMessage({
                          id: 'pages.quotation.status.inactive',
                          defaultMessage: '已失效',
                        })}
                  </Tag>
                ),
              },
              {
                title: intl.formatMessage({
                  id: 'pages.quotation.is_latest',
                  defaultMessage: '是否最新',
                }),
                dataIndex: 'isLatest',
                key: 'isLatest',
                render: (isLatest) => (
                  <Tag color={isLatest ? 'blue' : 'default'}>
                    {isLatest ? '是' : '否'}
                  </Tag>
                ),
              },
              {
                title: intl.formatMessage({
                  id: 'pages.common.createdAt',
                  defaultMessage: '创建时间',
                }),
                dataIndex: 'createdAt',
                key: 'createdAt',
              },
            ]}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <Empty
            description={intl.formatMessage({
              id: 'pages.quotation.history.empty',
              defaultMessage: '暂无历史报价记录',
            })}
          />
        )}
      </Spin>
    </Modal>
  );
};

export default HistoryModal; 