import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest, history, request } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Table,
  Modal,
  Row,
  Tag,
  message,
  Spin,
  Space,
  Tooltip,
  Popconfirm,
  Radio,
  Form,
  InputNumber,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Bill } from './data.d';
import { getBills, deleteBill, updateBill, getBillOrders, addBillPayment } from './service';
import useStyles from './style.style';
import { FormattedMessage, useIntl } from '@umijs/max';

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

// 账单列表项内容组件
const BillListContent: FC<{
  data: Bill;
}> = ({ data }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.listContent}>
      <div className={styles.listContentItem}>
        <span>账单金额</span>
        <p>${data.totalAmount}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>创建时间</span>
        <p>{dayjs(data.createdAt).format('YYYY-MM-DD HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>状态</span>
        <p>
          <Tag color={data.status === 'paid' ? 'success' : 'warning'}>
            {data.status === 'paid' ? '已结算' : '未结算'}
          </Tag>
        </p>
      </div>
    </div>
  );
};

const Info: FC<{
  title: React.ReactNode;
  value: React.ReactNode;
  bordered?: boolean;
}> = ({ title, value, bordered }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.headerInfo}>
      <span>{title}</span>
      <p>{value}</p>
      {bordered && <em />}
    </div>
  );
};

export const BillManagement: FC = () => {
  const { styles } = useStyles();
  const [billStatusFilter, setBillStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [visible, setVisible] = useState<boolean>(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [billOrdersVisible, setBillOrdersVisible] = useState<boolean>(false);
  const [billOrders, setBillOrders] = useState<any[]>([]);
  const [loadingBillOrders, setLoadingBillOrders] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [billsData, setBillsData] = useState<Bill[]>([]);
  const [agents, setAgents] = useState<{[key: number]: string}>({});
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [currentBillId, setCurrentBillId] = useState<number | null>(null);
  const [paymentForm] = Form.useForm();
  const intl = useIntl();

  // 获取代理商列表
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await request('/api/agents');
        if (Array.isArray(data)) {
          // 创建代理ID到代理名称的映射
          const agentMap: {[key: number]: string} = {};
          data.forEach(agent => {
            agentMap[agent.id] = agent.name;
          });
          setAgents(agentMap);
        }
      } catch (error) {
        console.error('获取代理商列表失败:', error);
      }
    };
    
    fetchAgents();
  }, []);

  // 使用useEffect获取账单数据
  useEffect(() => {
    const fetchBillsData = async () => {
      setLoading(true);
      try {
        const params: { status?: string } = {};
        if (billStatusFilter === 'paid') {
          params.status = 'paid';
        } else if (billStatusFilter === 'unpaid') {
          params.status = 'unpaid';
        } else if (billStatusFilter === 'partially_paid') {
          params.status = 'partially_paid';
        }
        
        const data = await request('/api/bills', {
          params,
        });
        
        // 处理不同格式的API响应
        let billsArray = [];
        if (Array.isArray(data)) {
          billsArray = data;
        } else if (data && typeof data === 'object') {
          // 尝试查找可能包含账单数组的属性
          const possibleArrayProps = ['data', 'bills', 'list', 'items'];
          for (const prop of possibleArrayProps) {
            if (Array.isArray(data[prop])) {
              billsArray = data[prop];
              break;
            }
          }
          
          // 如果没有找到任何数组属性，但数据对象有id字段，可能是单个账单对象
          if (billsArray.length === 0 && data.id) {
            billsArray = [data];
          }
        }
        
        setBillsData(billsArray);
      } catch (error) {
        console.error('获取账单数据失败:', error);
        setBillsData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillsData();
  }, [billStatusFilter]);

  // 计算统计数据
  const statistics = useMemo(() => {
    const unpaidBills = billsData.filter(bill => bill.status === 'unpaid');
    const partiallyPaidBills = billsData.filter(bill => bill.status === 'partially_paid');
    const paidBills = billsData.filter(bill => bill.status === 'paid');
    
    // 计算本月账单
    const currentMonth = dayjs().format('YYYY-MM');
    const currentMonthBills = billsData.filter(bill => 
      dayjs(bill.createdAt).format('YYYY-MM') === currentMonth
    );
    
    // 计算总金额
    const totalMonthAmount = currentMonthBills.reduce(
      (sum: number, bill) => {
        const amount = parseFloat(bill.totalAmount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 
      0
    ).toFixed(2);
    
    // 计算已收金额（部分付款和全额付款）
    const paidAmount = billsData.reduce((sum: number, bill) => {
      if (bill.paidAmount) {
        const amount = parseFloat(bill.paidAmount);
        return sum + (isNaN(amount) ? 0 : amount);
      }
      return sum;
    }, 0).toFixed(2);
    
    // 计算未收款金额
    const unpaidAmount = billsData.reduce((sum: number, bill) => {
      const totalAmount = parseFloat(bill.totalAmount);
      const paid = bill.paidAmount ? parseFloat(bill.paidAmount) : 0;
      return sum + (isNaN(totalAmount) ? 0 : totalAmount) - (isNaN(paid) ? 0 : paid);
    }, 0).toFixed(2);
    
    return {
      unpaidCount: unpaidBills.length,
      partiallyPaidCount: partiallyPaidBills.length,
      paidCount: paidBills.length,
      totalBillsCount: billsData.length,
      monthlyAmount: totalMonthAmount,
      monthlyPaidCount: currentMonthBills.filter(bill => bill.status === 'paid').length,
      totalPaidAmount: paidAmount,
      totalUnpaidAmount: unpaidAmount
    };
  }, [billsData]);

  // 过滤并分页
  const filteredBills = useMemo(() => {
    return billsData
      .filter(bill => {
        // 首先按状态筛选
        if (billStatusFilter !== 'all') {
          if (bill.status !== billStatusFilter) {
            return false;
          }
        }
        
        // 然后按代理商筛选
        if (agentFilter !== null) {
          if (bill.agentId !== agentFilter) {
            return false;
          }
        }
        
        // 最后按搜索文本筛选
        if (!searchText) return true;
        
        // 搜索逻辑：只搜索客户姓名和护照号码
        // 检查账单关联的所有订单
        if (bill.orders && bill.orders.length > 0) {
          // 如果任何一个订单的客户名称或护照号包含搜索文本，则返回true
          return bill.orders.some(order => {
            const customer = order.customer;
            if (!customer) return false;
            
            const nameMatch = customer.name && 
              customer.name.toLowerCase().includes(searchText.toLowerCase());
            
            const passportMatch = customer.passportNo && 
              customer.passportNo.toLowerCase().includes(searchText.toLowerCase());
            
            return nameMatch || passportMatch;
          });
        }
        
        return false;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [billsData, billStatusFilter, agentFilter, searchText]);

  // 创建代理商下拉菜单选项
  const agentOptions = useMemo(() => {
    const options = Object.entries(agents).map(([id, name]) => ({
      key: id,
      label: name,
      onClick: () => setAgentFilter(Number(id))
    }));
    
    // 添加"全部代理商"选项
    options.unshift({
      key: 'all',
      label: '全部代理商',
      onClick: () => setAgentFilter(null)
    });
    
    return options;
  }, [agents]);

  // 处理删除账单
  const handleDeleteBill = async (id: number) => {
    try {
      await deleteBill(id);
      message.success('账单删除成功');
      // 删除成功后重新获取数据
      const response = await fetch('/api/bills');
      const data = await response.json();
      if (Array.isArray(data)) {
        setBillsData(data);
      }
    } catch (error) {
      console.error('删除账单失败:', error);
      message.error('删除账单失败');
    }
  };

  // 处理更新账单状态
  const handleUpdateStatus = async (id: number, status: 'paid' | 'unpaid') => {
    try {
      await updateBill(id, { status });
      message.success(`账单已标记为${status === 'paid' ? '已结算' : '未结算'}`);
      // 更新成功后重新获取数据
      const response = await fetch('/api/bills');
      const data = await response.json();
      if (Array.isArray(data)) {
        setBillsData(data);
      }
    } catch (error) {
      console.error('更新账单状态失败:', error);
      message.error('更新账单状态失败');
    }
  };

  // 查看账单详情
  const viewBillDetail = (id: number) => {
    history.push(`/order/bill-management/detail/${id}`);
  };

  // 查看关联订单
  const handleViewBillOrders = async (billId: number) => {
    setLoadingBillOrders(true);
    try {
      const orders = await getBillOrders(billId);
      setBillOrders(orders);
      setBillOrdersVisible(true);
    } catch (error) {
      message.error('获取账单关联订单失败');
    } finally {
      setLoadingBillOrders(false);
    }
  };

  // 显示付款模态框
  const showPaymentModal = (billId: number) => {
    setCurrentBillId(billId);
    paymentForm.resetFields();
    setPaymentModalVisible(true);
  };

  // 处理添加付款
  const handleAddPayment = async () => {
    if (!currentBillId) return;
    
    try {
      const values = await paymentForm.validateFields();
      
      // 检查金额是否为有效数字
      if (isNaN(values.amount) || values.amount <= 0) {
        message.error('请输入有效的付款金额');
        return;
      }
      
      await addBillPayment(currentBillId, {
        amount: values.amount,
        remark: values.remark,
        paymentMethod: values.paymentMethod,
      });
      
      message.success('付款记录已添加');
      setPaymentModalVisible(false);
      
      // 重新获取账单列表以刷新数据
      try {
        const data = await request('/api/bills');
        console.log('更新账单列表数据:', data);
        if (Array.isArray(data)) {
          setBillsData(data);
        } else if (data && typeof data === 'object') {
          // 尝试查找可能包含账单数组的属性
          const possibleArrayProps = ['data', 'bills', 'list', 'items'];
          for (const prop of possibleArrayProps) {
            if (Array.isArray(data[prop])) {
              setBillsData(data[prop]);
              break;
            }
          }
        }
      } catch (err) {
        console.error('刷新账单列表失败:', err);
      }
    } catch (error) {
      console.error('添加付款记录失败:', error);
      message.error('添加付款记录失败');
    }
  };

  // 账单操作菜单
  const getActionMenu = (bill: Bill) => {
    const items = [
      {
        key: 'view',
        label: '查看详情',
      },
    ];
    
    // 只有未结算和部分结算的账单才显示付款选项
    if (bill.status !== 'paid') {
      items.push({
        key: 'payment',
        label: '添加付款',
      });
    }
    
    items.push(
      {
        key: 'status',
        label: bill.status === 'paid' ? '标记为未结算' : '标记为已结算',
      },
      {
        key: 'delete',
        label: '删除',
      }
    );

    return {
      items,
      onClick: ({ key }: { key: string }) => {
        if (key === 'view') {
          viewBillDetail(bill.id);
        } else if (key === 'payment') {
          showPaymentModal(bill.id);
        } else if (key === 'status') {
          const newStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
          Modal.confirm({
            title: `确认将账单 #${bill.id} 标记为${newStatus === 'paid' ? '已结算' : '未结算'}？`,
            onOk: () => handleUpdateStatus(bill.id, newStatus),
          });
        } else if (key === 'delete') {
          Modal.confirm({
            title: '删除账单',
            content: `确定要删除账单 #${bill.id} 吗？这将解除与订单的关联。`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => handleDeleteBill(bill.id),
          });
        }
      },
    };
  };

  // 定义简化版表格列
  const simpleColumns = [
    {
      title: '账单ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <a onClick={() => viewBillDetail(id)}>账单 #{id}</a>
      ),
    },
    {
      title: '订单数量',
      key: 'ordersCount',
      render: (_: any, record: Bill) => record.orders?.length || 0,
    },
    {
      title: '代理商',
      key: 'agent',
      render: (_: any, record: Bill) => {
        // 如果有代理ID，显示代理商名称
        if (record.agentId) {
          return agents[record.agentId] || `代理 #${record.agentId}`;
        }
        // 没有代理ID则显示无代理
        return '无代理';
      },
    },
    {
      title: '账单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: string) => `$${amount}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'success' : status === 'partially_paid' ? 'processing' : 'warning'}>
          {status === 'paid' ? '已结算' : status === 'partially_paid' ? '部分结算' : '未结算'}
        </Tag>
      ),
    },
    {
      title: '付款情况',
      key: 'paymentInfo',
      render: (_: any, record: Bill) => (
        <div>
          {record.paidAmount && (
            <div style={{ color: record.status === 'paid' ? '#52c41a' : '#1890ff' }}>
              已付: ${record.paidAmount}
            </div>
          )}
          {record.paidAmount && (
            <div style={{ 
              color: parseFloat(record.totalAmount) - parseFloat(record.paidAmount) <= 0 
                ? '#52c41a' 
                : '#f5222d',
              fontWeight: 'bold'
            }}>
              余款: ${(parseFloat(record.totalAmount) - parseFloat(record.paidAmount)).toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Bill) => (
        <Space>
          <a onClick={() => viewBillDetail(record.id)}>详情</a>
          {record.status !== 'paid' && (
            <a onClick={() => showPaymentModal(record.id)}>付款</a>
          )}
          <Popconfirm
            title="删除账单"
            description={`确定要删除账单 #${record.id} 吗？这将解除与订单的关联。`}
            onConfirm={() => handleDeleteBill(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const extraContent = (
    <div style={{ float: 'right', marginTop: 16 }}>
      <Space>
        <Button
          type={billStatusFilter === 'all' ? 'primary' : 'default'}
          onClick={() => setBillStatusFilter('all')}
        >
          全部
        </Button>
        <Button
          type={billStatusFilter === 'paid' ? 'primary' : 'default'}
          onClick={() => setBillStatusFilter('paid')}
        >
          已结算
        </Button>
        <Button
          type={billStatusFilter === 'partially_paid' ? 'primary' : 'default'}
          onClick={() => setBillStatusFilter('partially_paid')}
        >
          部分结算
        </Button>
        <Button
          type={billStatusFilter === 'unpaid' ? 'primary' : 'default'}
          onClick={() => setBillStatusFilter('unpaid')}
        >
          未结算
        </Button>
        <Dropdown menu={{ items: agentOptions }}>
          <Button>
            {agentFilter === null ? '选择代理商' : `代理: ${agents[agentFilter] || agentFilter}`} <DownOutlined />
          </Button>
        </Dropdown>
        <Search
          style={{ width: 240, marginLeft: 16 }}
          placeholder="搜索客户姓名或护照号码"
          onSearch={value => setSearchText(value)}
          allowClear
        />
      </Space>
    </div>
  );

  return (
    <PageContainer>
      <div className={styles.standardList}>
        <Card bordered={false}>
          <Row gutter={24}>
            <Col sm={8} xs={24}>
              <Info title="待收账单" value={`${statistics.unpaidCount + statistics.partiallyPaidCount} 个账单`} bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="已结算账单" value={`${statistics.paidCount} 个账单`} bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="总账单数" value={`${statistics.totalBillsCount} 个账单`} />
            </Col>
          </Row>
          <Row gutter={24} style={{ marginTop: '16px' }}>
            <Col sm={8} xs={24}>
              <Info title="已收金额" value={`$${statistics.totalPaidAmount}`} bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="未收金额" value={`$${statistics.totalUnpaidAmount}`} bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="本月账单总额" value={`$${statistics.monthlyAmount}`} />
            </Col>
          </Row>
        </Card>

        <Card
          className={styles.listCard}
          bordered={false}
          title="账单列表"
          style={{ marginTop: 24 }}
          extra={extraContent}
        >
          <div style={{ marginTop: 16 }}>
            <Spin spinning={loading}>
              <Table 
                rowKey="id"
                columns={simpleColumns}
                dataSource={filteredBills}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: filteredBills.length,
                  onChange: page => setCurrentPage(page),
                  onShowSizeChange: (_, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: total => `共 ${total} 项`,
                }}
              />
            </Spin>
          </div>
        </Card>
      </div>

      {/* 付款模态框 */}
      <Modal
        title="添加付款记录"
        open={paymentModalVisible}
        onOk={handleAddPayment}
        onCancel={() => setPaymentModalVisible(false)}
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

      {/* 账单详情弹窗 */}
      <Modal
        title="账单详情"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        {currentBill && (
          <div>
            <p><strong>账单ID:</strong> {currentBill.id}</p>
            <p><strong>模板ID:</strong> {currentBill.templateId}</p>
            <p><strong>总金额:</strong> ${currentBill.totalAmount}</p>
            <p><strong>状态:</strong> {currentBill.status === 'paid' ? '已付款' : '未付款'}</p>
            <p><strong>备注:</strong> {currentBill.remark || '无'}</p>
            <p><strong>创建时间:</strong> {new Date(currentBill.createdAt).toLocaleString()}</p>
            <p><strong>更新时间:</strong> {new Date(currentBill.updatedAt).toLocaleString()}</p>
          </div>
        )}
      </Modal>

      {/* 关联订单弹窗 */}
      <Modal
        title="关联订单"
        open={billOrdersVisible}
        onCancel={() => setBillOrdersVisible(false)}
        footer={null}
        width={800}
      >
        {loadingBillOrders ? (
          <div>加载中...</div>
        ) : (
          <Table
            rowKey="id"
            columns={[
              {
                title: '订单ID',
                dataIndex: 'id',
                key: 'id',
              },
              {
                title: '客户',
                key: 'customer',
                render: (_: any, record: any) => record.customer?.name || '未知',
              },
              {
                title: '金额',
                dataIndex: 'totalAmount',
                key: 'totalAmount',
                render: (amount: string) => `$${amount}`,
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
              },
            ]}
            dataSource={billOrders}
            pagination={false}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default BillManagement;
