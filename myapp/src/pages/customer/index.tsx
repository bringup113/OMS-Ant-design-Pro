import { removeRule, rule } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest, history } from '@umijs/max';
import { Button, Drawer, Input, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useCallback, useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
import moment from 'moment';

// 自定义客户类型
interface CustomerItem extends API.RuleListItem {
  passportNo?: string;
  gender?: 'male' | 'female';
  country?: string;
  birthDate?: number | string;
  issueDate?: number | string;
  expiryDate?: number | string;
  id?: string;
}

const CustomerList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<CustomerItem>();
  const [selectedRowsState, setSelectedRows] = useState<CustomerItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading } = useRequest(removeRule, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();

      messageApi.success('删除成功，即将刷新');
    },
    onError: () => {
      messageApi.error('删除失败，请重试');
    },
  });

  const columns: ProColumns<CustomerItem>[] = [
    {
      title: '客户姓名',
      dataIndex: 'name',
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
      title: '护照号码',
      dataIndex: 'passportNo',
      tooltip: '护照号码是唯一的',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      valueEnum: {
        male: { text: '男', status: 'Default' },
        female: { text: '女', status: 'Default' },
      },
    },
    {
      title: '国家',
      dataIndex: 'country',
      valueEnum: {
        china: { text: '中国', status: 'Default' },
        usa: { text: '美国', status: 'Default' },
        uk: { text: '英国', status: 'Default' },
        japan: { text: '日本', status: 'Default' },
        korea: { text: '韩国', status: 'Default' },
        france: { text: '法国', status: 'Default' },
        germany: { text: '德国', status: 'Default' },
        italy: { text: '意大利', status: 'Default' },
        russia: { text: '俄罗斯', status: 'Default' },
        canada: { text: '加拿大', status: 'Default' },
        australia: { text: '澳大利亚', status: 'Default' },
        newZealand: { text: '新西兰', status: 'Default' },
      },
    },
    {
      title: '出生日期',
      dataIndex: 'birthDate',
      valueType: 'date',
    },
    {
      title: '护照有效期',
      dataIndex: 'passportValidity',
      render: (_, record) => {
        if (record.issueDate && record.expiryDate) {
          return `${moment(record.issueDate).format('YYYY-MM-DD')} 至 ${moment(record.expiryDate).format('YYYY-MM-DD')}`;
        }
        return '-';
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            history.push(`/customer/edit/${record.id}`);
          }}
        >
          编辑
        </a>,
        <a
          key="view"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          查看
        </a>,
      ],
    },
  ];

  /**
   * 删除节点
   *
   * @param selectedRows
   */
  const handleRemove = useCallback(
    async (selectedRows: CustomerItem[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('请选择删除项');

        return;
      }

      await delRun({
        data: {
          key: selectedRows.map((row) => row.key),
        },
      });
    },
    [delRun],
  );

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<CustomerItem, API.PageParams>
        headerTitle="客户列表"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            onClick={() => {
              history.push('/customer/create-customer');
            }}
            icon={<PlusOutlined />}
          >
            新建客户
          </Button>
        ]}
        request={rule}
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
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
            </div>
          }
        >
          <Button
            loading={loading}
            onClick={() => {
              handleRemove(selectedRowsState);
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
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
          <ProDescriptions<CustomerItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<CustomerItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default CustomerList; 