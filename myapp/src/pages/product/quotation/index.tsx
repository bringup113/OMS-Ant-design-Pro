import { PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Button, Space, Modal, message, Select, Tooltip } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { getQuotations, deleteQuotation, deleteQuotationsByProductAndSupplier } from '@/services/system/quotation';
import { getProducts } from '@/services/system/product';
import { getSuppliers } from '@/services/system/organization';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import FormModal from './components/FormModal';
import HistoryModal from './components/HistoryModal';
import type { QuotationItem } from './typing';
import type { ProductItem } from '@/pages/product/list/typing';

const QuotationList: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [historyModalVisible, setHistoryModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<QuotationItem>();
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [productOptions, setProductOptions] = useState<{ label: string; value: number }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: number }[]>([]);

  // 获取产品和供应商数据用于筛选
  useEffect(() => {
    // 获取产品列表
    const fetchProducts = async () => {
      try {
        const response = await getProducts({});
        
        if (response && response.data && Array.isArray(response.data)) {
          const options = response.data.map((item: ProductItem) => ({
            label: `${item.name}${item.country ? ` (${item.country})` : ''}`,
            value: item.id,
          }));
          setProductOptions(options);
        }
      } catch (error) {
        console.error('获取产品列表失败:', error);
      }
    };

    // 获取供应商列表
    const fetchSuppliers = async () => {
      try {
        const suppliers = await getSuppliers();
        
        if (Array.isArray(suppliers)) {
          const options = suppliers.map((item) => ({
            label: item.name,
            value: Number(item.id),
          }));
          setSupplierOptions(options);
        }
      } catch (error) {
        console.error('获取供应商列表失败:', error);
      }
    };

    fetchProducts();
    fetchSuppliers();
  }, []);

  // 删除报价
  const handleDelete = async (record: QuotationItem) => {
    Modal.confirm({
      title: intl.formatMessage({
        id: 'pages.common.delete.confirm',
        defaultMessage: '确认删除',
      }),
      content: intl.formatMessage({
        id: 'pages.quotation.delete.confirm.content',
        defaultMessage: '确定要删除该产品的所有报价记录吗？删除后不可恢复。',
      }),
      onOk: async () => {
        try {
          await deleteQuotationsByProductAndSupplier(record.productId, record.supplierId);
          message.success(
            intl.formatMessage({
              id: 'pages.common.delete.success',
              defaultMessage: '删除成功',
            }),
          );
          actionRef.current?.reload();
        } catch (error) {
          console.error('删除失败:', error);
          message.error(
            intl.formatMessage({
              id: 'pages.common.delete.failed',
              defaultMessage: '删除失败',
            }),
          );
        }
      },
    });
  };

  // 查看历史报价
  const handleViewHistory = (record: QuotationItem) => {
    setSelectedProductId(record.productId);
    setSelectedSupplierId(record.supplierId);
    setHistoryModalVisible(true);
  };

  // 编辑报价
  const handleEdit = (record: QuotationItem) => {
    setCurrentRow({...record});
    setCreateModalVisible(true);
  };

  const columns: ProColumns<QuotationItem>[] = [
    {
      title: <FormattedMessage id="pages.quotation.product" defaultMessage="产品" />,
      dataIndex: 'productId',
      search: true,
      filters: productOptions.map(option => ({
        text: option.label,
        value: option.value,
      })),
      filterMultiple: true,
      renderFormItem: () => (
        <Select
          placeholder="请选择产品"
          options={productOptions}
          showSearch
          optionFilterProp="label"
          allowClear
        />
      ),
      render: (_, record) => record.product?.name || '-',
    },
    {
      title: <FormattedMessage id="pages.quotation.supplier" defaultMessage="供应商" />,
      dataIndex: 'supplierId',
      search: true,
      filters: supplierOptions.map(option => ({
        text: option.label,
        value: option.value,
      })),
      filterMultiple: true,
      renderFormItem: () => (
        <Select
          placeholder="请选择供应商"
          options={supplierOptions}
          showSearch
          optionFilterProp="label"
          allowClear
        />
      ),
      render: (_, record) => record.supplier?.name || '-',
    },
    {
      title: <FormattedMessage id="pages.quotation.price" defaultMessage="采购价格" />,
      dataIndex: 'price',
      search: false,
      render: (text) => text,
    },
    {
      title: <FormattedMessage id="pages.quotation.agentPrice" defaultMessage="代理价格" />,
      dataIndex: 'agentPrice',
      search: false,
      render: (text) => text || '-',
    },
    {
      title: <FormattedMessage id="pages.quotation.salePrice" defaultMessage="销售价格" />,
      dataIndex: 'salePrice',
      search: false,
      render: (text) => text || '-',
    },
    {
      title: <FormattedMessage id="pages.quotation.status" defaultMessage="状态" />,
      dataIndex: 'status',
      search: true,
      valueEnum: {
        active: {
          text: <FormattedMessage id="pages.quotation.status.active" defaultMessage="生效中" />,
          status: 'Success',
        },
        inactive: {
          text: <FormattedMessage id="pages.quotation.status.inactive" defaultMessage="已失效" />,
          status: 'Default',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.quotation.remark" defaultMessage="备注" />,
      dataIndex: 'remark',
      search: false,
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="pages.common.createdBy" defaultMessage="创建人" />,
      dataIndex: 'createdBy',
      search: false,
      render: (_, record) => record.createdByUser?.name || record.createdBy || '-',
    },
    {
      title: <FormattedMessage id="pages.common.createTime" defaultMessage="创建时间" />,
      dataIndex: 'createdAt',
      search: false,
      render: (_, record) => record.createdAt ? new Date(record.createdAt).toLocaleString() : '-',
    },
    {
      title: <FormattedMessage id="pages.common.option" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        const actions = [];

        actions.push(
          <a
            key="edit"
            onClick={() => handleEdit(record)}
          >
            <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
          </a>
        );

        actions.push(
          <a
            key="history"
            onClick={() => handleViewHistory(record)}
          >
            <Tooltip title={intl.formatMessage({
              id: 'pages.quotation.history',
              defaultMessage: '查看历史报价',
            })}>
              <HistoryOutlined /> <FormattedMessage id="pages.quotation.history" defaultMessage="历史" />
            </Tooltip>
          </a>
        );

        if (!access.isSupplier) {
          actions.push(
            <a
              key="delete"
              onClick={() => handleDelete(record)}
              style={{ color: '#ff4d4f' }}
            >
              <FormattedMessage id="pages.common.delete" defaultMessage="删除" />
            </a>
          );
        }

        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<QuotationItem>
        headerTitle={intl.formatMessage({
          id: 'pages.quotation.title',
          defaultMessage: '报价管理',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
          defaultColsNumber: 4,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.quotation.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          // 处理筛选参数
          const productId = filter.productId ? filter.productId : undefined;
          const supplierId = filter.supplierId ? filter.supplierId : undefined;
          
          const requestParams = {
            ...params,
            productId: params.productId ? Number(params.productId) : 
                      (productId && productId.length > 0) ? Number(productId[0]) : undefined,
            supplierId: params.supplierId ? Number(params.supplierId) : 
                       (supplierId && supplierId.length > 0) ? Number(supplierId[0]) : undefined,
            is_latest: true, // 只获取最新报价
          };
          
          console.log('请求参数:', requestParams, '筛选:', filter);
          return getQuotations(requestParams);
        }}
        columns={columns}
      />

      <FormModal
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onSuccess={() => {
          setCreateModalVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        values={currentRow}
      />

      <HistoryModal
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        productId={selectedProductId}
        supplierId={selectedSupplierId}
      />
    </PageContainer>
  );
};

export default QuotationList; 