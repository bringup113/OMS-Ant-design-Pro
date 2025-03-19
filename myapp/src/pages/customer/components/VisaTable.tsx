import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, message } from 'antd';
import { useState } from 'react';
import moment from 'moment';
import { deleteVisa } from '@/services/system/customer';
import { VisaItem } from './VisaModal';
import VisaFormModal from './VisaFormModal';

export interface VisaTableProps {
  customerId: number;
  dataSource: VisaItem[];
  loading: boolean;
  onRefresh: () => void;
}

const VisaTable: React.FC<VisaTableProps> = ({
  customerId,
  dataSource,
  loading,
  onRefresh,
}) => {
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [currentVisa, setCurrentVisa] = useState<VisaItem | undefined>(undefined);

  const handleDelete = async (id: number) => {
    try {
      await deleteVisa(id);
      message.success('删除成功');
      onRefresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleAddVisa = () => {
    setCurrentVisa(undefined);
    setFormModalVisible(true);
  };

  const handleEditVisa = (record: VisaItem) => {
    setCurrentVisa(record);
    setFormModalVisible(true);
  };

  const handleFormModalClose = (refresh?: boolean) => {
    setFormModalVisible(false);
    if (refresh) {
      onRefresh();
    }
  };

  const columns: ProColumns<VisaItem>[] = [
    {
      title: '国家',
      dataIndex: 'country',
    },
    {
      title: '签证名称',
      dataIndex: 'visaName',
    },
    {
      title: '签发日期',
      dataIndex: 'issueDate',
      render: (_, record) => record.issueDate ? moment(record.issueDate).format('YYYY-MM-DD') : '-',
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      render: (_, record) => record.expiryDate ? moment(record.expiryDate).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <a key="edit" onClick={() => handleEditVisa(record)}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除此签证信息吗？"
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
    <>
      <ProTable<VisaItem>
        headerTitle="签证列表"
        rowKey="id"
        search={false}
        options={false}
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        pagination={{
          pageSize: 5,
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={handleAddVisa}
          >
            <PlusOutlined /> 添加签证
          </Button>,
        ]}
      />

      <VisaFormModal
        visible={formModalVisible}
        onCancel={() => handleFormModalClose()}
        onSuccess={() => handleFormModalClose(true)}
        customerId={customerId}
        initialValues={currentVisa}
      />
    </>
  );
};

export default VisaTable; 