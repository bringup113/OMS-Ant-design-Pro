import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useAccess, useIntl } from '@umijs/max';
import { Button, Space, Modal, message, Select, TreeSelect } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '@/services/system/product';
import { getEnabledProductCategoryTreeSelect } from '@/services/system/product-category';
import { getCountries } from '@/pages/system/country/service';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import FormModal from './components/FormModal';
import type { ProductItem } from './typing';
import type { API } from '@/pages/system/country/typing';

const ProductList: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<ProductItem>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const intl = useIntl();
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: number }[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);

  // 获取产品类别和国家数据
  useEffect(() => {
    // 获取产品类别
    const fetchCategories = async () => {
      try {
        const response = await getEnabledProductCategoryTreeSelect();
        console.log('获取已启用产品类别树(TreeSelect格式):', response);
        
        if (response && response.data && Array.isArray(response.data)) {
          setCategoryOptions(response.data);
        }
      } catch (error) {
        console.error('获取产品类别树失败:', error);
      }
    };

    // 获取国家列表
    const fetchCountries = async () => {
      try {
        const response = await getCountries({});
        
        if (response && response.data && Array.isArray(response.data)) {
          const options = response.data.map((item: API.CountryListItem) => ({
            label: item.name,
            value: item.name,
          }));
          setCountryOptions(options);
        }
      } catch (error) {
        console.error('获取国家列表失败:', error);
      }
    };

    fetchCategories();
    fetchCountries();
  }, []);

  // 删除产品
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: intl.formatMessage({
        id: 'pages.common.delete.confirm',
        defaultMessage: '确认删除',
      }),
      content: intl.formatMessage({
        id: 'pages.common.delete.confirm.content',
        defaultMessage: '确定要删除这条记录吗？删除后不可恢复。',
      }),
      onOk: async () => {
        try {
          await deleteProduct(id);
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

  const columns: ProColumns<ProductItem>[] = [
    {
      title: <FormattedMessage id="pages.product.country" defaultMessage="国家" />,
      dataIndex: 'country',
      search: true,
      filters: countryOptions.map(option => ({
        text: option.label,
        value: option.value,
      })),
      filterMultiple: true,
      renderFormItem: () => (
        <Select
          placeholder="请选择国家"
          options={countryOptions}
          showSearch
          optionFilterProp="label"
          allowClear
        />
      ),
    },
    {
      title: <FormattedMessage id="pages.product.category" defaultMessage="产品类别" />,
      dataIndex: 'categoryId',
      search: true,
      filters: categoryOptions.map(option => ({
        text: option.label,
        value: option.value,
      })),
      filterMultiple: true,
      renderFormItem: () => (
        <TreeSelect
          placeholder="请选择产品类别"
          treeData={categoryOptions}
          showSearch
          treeNodeFilterProp="label"
          allowClear
          treeLine
          treeDefaultExpandAll
        />
      ),
      render: (_, record) => record.category?.name || '-',
    },
    {
      title: <FormattedMessage id="pages.product.name" defaultMessage="产品名称" />,
      dataIndex: 'name',
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
            onClick={() => {
              console.log('编辑产品数据:', record);
              setCurrentRow(record);
              setCreateModalVisible(true);
            }}
          >
            <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
          </a>
        );

        actions.push(
          <a
            key="copy"
            onClick={() => {
              console.log('复制产品数据:', record);
              // 创建一个新的产品对象，只保留需要的字段
              const newProduct = {
                name: record.name,
                categoryId: record.categoryId,
                description: record.description,
                country: record.country,
                status: record.status,
              };
              // 打开新建表单，并填入复制的数据
              setCurrentRow(newProduct as any);
              setCreateModalVisible(true);
            }}
          >
            <FormattedMessage id="pages.common.copy" defaultMessage="复制" />
          </a>
        );

        if (!access.isSupplier) {
          actions.push(
            <a
              key="delete"
              onClick={() => handleDelete(record.id)}
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
      <ProTable<ProductItem>
        headerTitle={intl.formatMessage({
          id: 'pages.product.title',
          defaultMessage: '产品列表',
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
            <PlusOutlined /> <FormattedMessage id="pages.product.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          // 处理TreeSelect的值和筛选参数
          const { categoryId, ...restParams } = params;
          
          // 处理筛选参数
          const country = filter.country ? filter.country : undefined;
          const categoryIdFilter = filter.categoryId ? filter.categoryId : undefined;
          
          const requestParams = {
            ...restParams,
            categoryId: categoryId ? Number(categoryId) : 
                       (categoryIdFilter && categoryIdFilter.length > 0) ? Number(categoryIdFilter[0]) : undefined,
            country: country && country.length > 0 ? String(country[0]) : undefined,
          };
          
          console.log('请求参数:', requestParams, '筛选:', filter);
          return getProducts(requestParams);
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
    </PageContainer>
  );
};

export default ProductList;
