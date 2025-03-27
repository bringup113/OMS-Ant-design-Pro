import { PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import { useRef, useState, useMemo } from 'react';
import { history, useRequest } from '@umijs/max';
import moment from 'moment';
import { getCustomers, deleteCustomer } from '@/services/system/customer';
import { getCountries } from '@/services/system/country';

const CustomerList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  
  // 获取国家列表
  const { data: countryData } = useRequest(getCountries, {
    defaultParams: [{ pageSize: 1000, status: 'enabled' }],
  });
  
  // 转换国家数据为valueEnum格式
  const countryValueEnum = useMemo(() => {
    const valueEnum: Record<string, { text: string, status: string }> = {};
    if (countryData?.data) {
      countryData.data.forEach((item: any) => {
        valueEnum[item.name] = { text: item.name, status: 'default' };
      });
    }
    return valueEnum;
  }, [countryData]);

  // 处理删除客户
  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<API.CustomerItem>[] = [
    {
      title: '客户姓名',
      dataIndex: 'name',
      render: (_, record) => (
        <a onClick={() => history.push(`/customer/detail/${record.id}`)}>{record.name}</a>
      ),
    },
    {
      title: '护照号码',
      dataIndex: 'passportNo',
      copyable: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      valueEnum: {
        male: { text: '男', status: 'default' },
        female: { text: '女', status: 'default' },
      },
    },
    {
      title: '国家',
      dataIndex: 'country',
      valueEnum: countryValueEnum,
    },
    {
      title: '出生日期',
      dataIndex: 'birthDate',
      render: (_, record) => record.birthDate ? moment(record.birthDate).format('YYYY-MM-DD') : '-',
    },
    {
      title: '护照有效期',
      dataIndex: 'passportValidity',
      render: (_, record) => {
        const issueDate = record.issueDate ? moment(record.issueDate).format('YYYY-MM-DD') : '-';
        const expiryDate = record.expiryDate ? moment(record.expiryDate).format('YYYY-MM-DD') : '-';
        return `${issueDate} 至 ${expiryDate}`;
      },
    },
    {
      title: '签证数量',
      dataIndex: 'visaCount',
      render: (_, record) => (
        <Tag color="blue">{record.visaCount || 0}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (_, record) => record.createdAt ? moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="detail" onClick={() => history.push(`/customer/detail/${record.id}`)}>
          详情
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除此客户吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.CustomerItem>
        headerTitle="客户列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => history.push('/customer/create-customer')}
          >
            <PlusOutlined /> 新建客户
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await getCustomers({
            current,
            pageSize,
            ...rest,
          });
          return {
            data: response.data,
            success: response.success,
            total: response.total,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default CustomerList; 