import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Modal, message, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { getCustomerVisas, deleteVisa } from '@/services/system/customer';
import VisaFormModal from './VisaFormModal';

export interface VisaModalProps {
  visible: boolean;
  onCancel: () => void;
  customerId: number;
  customerName: string;
}

export interface VisaItem {
  id: number;
  customerId: number;
  country: string;
  visaName: string;
  issueDate: number | null;
  expiryDate: number | null;
  createdAt?: string;
  updatedAt?: string;
}

const VisaModal: React.FC<VisaModalProps> = ({
  visible,
  onCancel,
  customerId,
  customerName,
}) => {
  const [visas, setVisas] = useState<VisaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [currentVisa, setCurrentVisa] = useState<VisaItem | undefined>(undefined);

  const fetchVisas = async () => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      const response = await getCustomerVisas(customerId);
      if (response.success) {
        setVisas(response.data || []);
      }
    } catch (error) {
      message.error('获取签证信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && customerId) {
      fetchVisas();
    }
  }, [visible, customerId]);

  const handleDelete = async (id: number) => {
    try {
      await deleteVisa(id);
      message.success('删除成功');
      fetchVisas();
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
      fetchVisas();
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
      <Modal
        title={`${customerName} 的签证信息`}
        open={visible}
        onCancel={onCancel}
        width={800}
        footer={null}
      >
        <ProTable<VisaItem>
          headerTitle="签证列表"
          rowKey="id"
          search={false}
          options={false}
          loading={loading}
          dataSource={visas}
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
      </Modal>

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

export default VisaModal; 