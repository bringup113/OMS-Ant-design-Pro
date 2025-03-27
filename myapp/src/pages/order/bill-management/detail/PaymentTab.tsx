import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getBillPayments, addBillPayment, deletePaymentRecord } from '../../bill-management/service';
import type { PaymentRecord } from '../../bill-management/data';

const { Option } = Select;
const { TextArea } = Input;

interface PaymentTabProps {
  billId: number;
  billTotalAmount: string;
  onPaymentChange: () => void;
}

const PaymentTab: React.FC<PaymentTabProps> = ({ billId, billTotalAmount, onPaymentChange }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [paymentForm] = Form.useForm();
  const [paymentTotal, setPaymentTotal] = useState<number>(0);

  // 获取付款记录
  const fetchPaymentRecords = async () => {
    setLoading(true);
    try {
      const records = await getBillPayments(billId);
      if (Array.isArray(records)) {
        setPaymentRecords(records);
        
        // 计算总付款金额
        const total = records.reduce((sum, record) => sum + parseFloat(record.amount), 0);
        setPaymentTotal(total);
      }
    } catch (error) {
      console.error('获取付款记录失败:', error);
      message.error('获取付款记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRecords();
  }, [billId]);

  // 显示添加付款模态框
  const showAddPaymentModal = () => {
    paymentForm.resetFields();
    setAddModalVisible(true);
  };

  // 添加付款记录
  const handleAddPayment = async () => {
    try {
      const values = await paymentForm.validateFields();
      
      await addBillPayment(billId, {
        amount: values.amount,
        remark: values.remark,
        paymentMethod: values.paymentMethod,
      });
      
      message.success('付款记录已添加');
      setAddModalVisible(false);
      fetchPaymentRecords();
      onPaymentChange(); // 通知父组件刷新账单状态
    } catch (error) {
      console.error('添加付款记录失败:', error);
    }
  };

  // 删除付款记录
  const handleDeletePayment = async (paymentId: number) => {
    try {
      await deletePaymentRecord(paymentId);
      message.success('付款记录已删除');
      fetchPaymentRecords();
      onPaymentChange(); // 通知父组件刷新账单状态
    } catch (error) {
      console.error('删除付款记录失败:', error);
      message.error('删除付款记录失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '付款ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '付款金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => `$${amount}`,
    },
    {
      title: '付款方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => {
        let color = 'default';
        let text = method;
        
        switch (method) {
          case 'cash':
            color = 'green';
            text = '现金';
            break;
          case 'transfer':
            color = 'blue';
            text = '转账';
            break;
          case 'check':
            color = 'purple';
            text = '支票';
            break;
          case 'other':
            text = '其他';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '付款日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PaymentRecord) => (
        <Popconfirm
          title="删除付款记录"
          description="确定要删除这条付款记录吗？"
          onConfirm={() => handleDeletePayment(record.id)}
          okText="确认"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>
      ),
    },
  ];

  const billTotalAmountNum = parseFloat(billTotalAmount);
  const remainingAmount = billTotalAmountNum - paymentTotal;

  return (
    <div>
      <Card
        title="付款记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddPaymentModal}>
            添加付款
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <div>
              <span style={{ fontWeight: 'bold' }}>账单总额: </span>
              <span>${billTotalAmount}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>已付金额: </span>
              <span style={{ color: '#1890ff' }}>${paymentTotal.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>余款: </span>
              <span style={{ 
                color: remainingAmount <= 0 ? '#52c41a' : '#f5222d', 
                fontWeight: 'bold' 
              }}>
                ${remainingAmount.toFixed(2)}
              </span>
            </div>
          </Space>
        </div>
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={paymentRecords}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 添加付款记录模态框 */}
      <Modal
        title="添加付款记录"
        open={addModalVisible}
        onOk={handleAddPayment}
        onCancel={() => setAddModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={paymentForm}
          layout="vertical"
          initialValues={{ paymentMethod: 'cash' }}
        >
          <Form.Item
            name="amount"
            label="付款金额"
            rules={[{ required: true, message: '请输入付款金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              max={100000000}
              precision={2}
              placeholder="输入付款金额"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value?: string) => value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0}
            />
          </Form.Item>
          
          <Form.Item
            name="paymentMethod"
            label="付款方式"
          >
            <Select>
              <Option value="cash">现金</Option>
              <Option value="transfer">转账</Option>
              <Option value="check">支票</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="输入付款备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentTab; 