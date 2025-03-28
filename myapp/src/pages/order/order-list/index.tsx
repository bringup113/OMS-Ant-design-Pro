import { DownOutlined, PlusOutlined, SearchOutlined, FileAddOutlined, EllipsisOutlined, SnippetsOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest, history, request, useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Table,
  Modal,
  Tag,
  Radio,
  Row,
  message,
  List,
  Space,
  Spin,
  Popconfirm,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { queryFakeList, removeFakeList, getBillStyleTemplates, createBill } from './service';
import useStyles from './style.style';
import type { OrderItem, Agent } from './data.d';
import { StatusTag, PermissionControl } from '@/components';
import { getAgents } from '@/services/agent';
import debounce from 'lodash/debounce';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;

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

// 防抖处理搜索
const debouncedSearch = debounce((value: string, callback: (value: string) => void) => {
  callback(value);
}, 500);

export const OrderList: FC = () => {
  const { styles } = useStyles();
  const [orderData, setOrderData] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [agentsData, setAgentsData] = useState<Agent[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [billStyleModalVisible, setBillStyleModalVisible] = useState<boolean>(false);
  const access = useAccess();

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [processingOrdersCount, setProcessingOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);

  const calculateLocalStatistics = useCallback(() => {
    if (!orderData || orderData.length === 0) {
      setPendingOrdersCount(0);
      setProcessingOrdersCount(0);
      setCompletedOrdersCount(0);
      return;
    }

    const pendingCount = orderData.filter(item => item.status === 'pending').length;
    const processingCount = orderData.filter(item => item.status === 'processing').length;
    const completedCount = orderData.filter(item => item.status === 'completed').length;
    
    setPendingOrdersCount(pendingCount);
    setProcessingOrdersCount(processingCount);
    setCompletedOrdersCount(completedCount);
    
    console.log('使用本地数据计算统计:', { pendingCount, processingCount, completedCount });
  }, [orderData]);

  const fetchAgents = useCallback(async () => {
    try {
      const agents = await request('/api/agents');
      if (Array.isArray(agents)) {
        setAgentsData(agents);
      }
    } catch (error) {
      console.error('获取代理数据失败:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await queryFakeList({ 
        count: 50,
        page: currentPage,
        pageSize: pageSize,
        keyword: searchText,
      });
      
      if (result && result.data && Array.isArray(result.data)) {
        const ordersWithAgent = result.data.map(order => {
          if (order.agentId) {
            const agent = agentsData.find(a => a.id === order.agentId);
            return {
              ...order,
              agent: agent || undefined
            };
          }
          
          if (!order.status && Array.isArray(order.businesses)) {
            const status = calculateOrderStatus(order.businesses);
            return { ...order, status };
          }
          
          return order;
        });
        
        setOrderData(ordersWithAgent);
        setTotal(result.total || 0);
        
        calculateLocalStatistics();
      } else {
        message.error('获取订单数据格式错误');
      }
    } catch (error) {
      console.error('获取订单数据失败:', error);
      message.error('获取订单数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, agentsData, searchText, calculateLocalStatistics]);

  const calculateOrderStatus = (businesses: any[]): 'pending' | 'processing' | 'completed' | 'cancelled' => {
    if (!businesses || businesses.length === 0) {
      return 'pending';
    }

    const allCancelled = businesses.every(business => business.status === 'cancelled');
    if (allCancelled) {
      return 'cancelled';
    }

    const allCompleted = businesses.every(business => business.status === 'completed');
    if (allCompleted) {
      return 'completed';
    }

    const anyProcessing = businesses.some(business => business.status === 'processing');
    if (anyProcessing) {
      return 'processing';
    }

    return 'pending';
  };

  const fetchBillTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const response = await getBillStyleTemplates();
      if (Array.isArray(response)) {
        setTemplates(response);
        const defaultTemplate = response.find(t => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else if (response.length > 0) {
          setSelectedTemplateId(response[0].id);
        }
      } else {
        message.error('获取账单样式列表失败');
      }
    } catch (error) {
      console.error('获取账单样式失败:', error);
      message.error('获取账单样式失败');
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const fetchOrderStatistics = useCallback(async () => {
    try {
      const response = await request('/api/orders/statistics');
      
      if (response && response.success) {
        setPendingOrdersCount(response.pending || 0);
        setProcessingOrdersCount(response.processing || 0);
        setCompletedOrdersCount(response.completed || 0);
      } else {
        calculateLocalStatistics();
      }
    } catch (error) {
      console.error('获取订单统计失败:', error);
      calculateLocalStatistics();
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (agentsData.length > 0) {
      fetchOrders();
    }
  }, [fetchOrders, agentsData]);

  useEffect(() => {
    if (agentsData.length > 0) {
      fetchOrderStatistics();
    }
  }, [agentsData, fetchOrderStatistics]);

  const deleteItem = useCallback(async (id: number) => {
    Modal.confirm({
      title: '删除订单',
      content: '确定删除该订单吗？此操作不可撤销',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await removeFakeList({ id: id.toString() });
          
          if (response && response.success) {
            message.success(response.message || '订单删除成功');
            fetchOrders();
          } else {
            const errorMsg = response?.message || '删除订单失败';
            if (errorMsg.includes('账单')) {
              Modal.error({
                title: '无法删除订单',
                content: (
                  <div>
                    <p>{errorMsg}</p>
                    <p>提示：已关联账单的订单不能直接删除，请先从账单中移除该订单或删除账单。</p>
                  </div>
                ),
              });
            } else {
              message.error(errorMsg);
            }
          }
        } catch (error) {
          console.error('删除订单失败:', error);
          message.error('删除订单失败，可能是权限问题或该订单无法删除');
        } finally {
          setLoading(false);
        }
      },
    });
  }, [fetchOrders]);

  const handleMenuClick = useCallback((key: string, record: OrderItem) => {
    if (key === 'edit') {
      history.push(`/order/order-list/edit/${record.id}`);
    } else if (key === 'delete') {
      deleteItem(record.id);
    }
  }, [deleteItem]);

  const filteredData = useMemo(() => {
    let result = [...orderData];
    
    if (filterStatus !== 'all') {
      result = result.filter(item => {
        if (filterStatus === 'progress') return item.status === 'processing';
        if (filterStatus === 'waiting') return item.status === 'pending';
        return true;
      });
    }
    
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(item => {
        const customerMatch = item.customer?.name && 
          item.customer.name.toLowerCase().includes(lowerSearchText);
        
        const passportMatch = item.customer?.passportNo && 
          item.customer.passportNo.toLowerCase().includes(lowerSearchText);
        
        const agentMatch = item.agent?.name && 
          item.agent.name.toLowerCase().includes(lowerSearchText);
        
        const supplierMatch = item.businesses && Array.isArray(item.businesses) && 
          item.businesses.some(biz => 
            biz.supplier?.name && 
            biz.supplier.name.toLowerCase().includes(lowerSearchText)
          );
        
        return customerMatch || passportMatch || agentMatch || supplierMatch;
      });
    }
    
    return result;
  }, [orderData, filterStatus, searchText]);

  const handleSearch = useCallback((value: string) => {
    debouncedSearch(value, (searchValue) => {
      setSearchText(searchValue);
      setCurrentPage(1);
    });
  }, []);

  const handleCreateBill = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要生成账单的订单');
      return;
    }
    
    setSelectedTemplateId(null);
    fetchBillTemplates();
    setBillStyleModalVisible(true);
  }, [selectedRowKeys, fetchBillTemplates]);

  const confirmCreateBill = useCallback(async () => {
    if (!selectedTemplateId) {
      message.warning('请选择账单样式');
      return;
    }

    try {
      const response = await createBill({
        orderIds: selectedRowKeys.map(key => Number(key)),
        templateId: selectedTemplateId,
      });

      if (response && response.id) {
        message.success(`已成功创建账单 #${response.id}`);
        setSelectedRowKeys([]);
        setBillStyleModalVisible(false);
        fetchOrders();
      } else {
        message.error('创建账单失败');
      }
    } catch (error) {
      console.error('创建账单失败:', error);
      message.error('创建账单失败，请稍后重试');
    }
  }, [selectedRowKeys, selectedTemplateId, fetchOrders]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: OrderItem) => ({
      disabled: record.accountStatus === 'billed',
      name: record.id.toString(),
    }),
  };

  const extraContent = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <RadioGroup 
        defaultValue="all" 
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
      >
        <RadioButton value="all">全部</RadioButton>
        <RadioButton value="progress">处理中</RadioButton>
        <RadioButton value="waiting">待处理</RadioButton>
      </RadioGroup>
      
      <PermissionControl permissionCode="order:add">
        <Button
          type="primary"
          onClick={() => history.push('/order/order-list/create')}
          style={{ margin: '0 16px' }}
        >
          <PlusOutlined />
          添加订单
        </Button>
      </PermissionControl>
      
      <PermissionControl customCheck={(access) => access.canCreateBill}>
        <Button 
          type="primary"
          onClick={handleCreateBill} 
          disabled={selectedRowKeys.length === 0}
          style={{ marginRight: '16px' }}
        >
          创建账单 {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
        </Button>
      </PermissionControl>
      
      <Search 
        className={styles.extraContentSearch} 
        placeholder="搜索客户/护照号/供应商/代理" 
        onSearch={handleSearch}
        allowClear 
      />
    </div>
  );

  const getAgentName = useCallback((agentId: number | null) => {
    if (!agentId) return '无代理';
    const agent = agentsData.find(a => a.id === agentId);
    return agent ? agent.name : `代理ID: ${agentId}`;
  }, [agentsData]);

  const columns = [
    {
      title: '护照号码',
      dataIndex: 'customer',
      key: 'passportNo',
      render: (customer: any, record: OrderItem) => (
        <a onClick={(e) => {
          e.preventDefault();
          history.push(`/order/order-list/detail/${record.id}`);
        }}>{customer?.passportNo || '-'}</a>
      ),
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: any) => customer?.name || '未知客户',
    },
    {
      title: '供应商',
      dataIndex: 'businesses',
      key: 'supplier',
      render: (businesses: any[]) => {
        if (!businesses || businesses.length === 0) return '无';
        
        const uniqueSuppliers = [...new Set(
          businesses
            .filter(biz => biz.supplier && biz.supplier.name)
            .map(biz => biz.supplier.name)
        )];
        
        return uniqueSuppliers.join(', ') || '无';
      },
    },
    {
      title: '代理',
      dataIndex: 'agentId',
      key: 'agent',
      render: (agentId: number | null) => getAgentName(agentId),
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: string) => `$${amount}`,
      sorter: (a: OrderItem, b: OrderItem) => 
        parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} type="order" />,
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '处理中', value: 'processing' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'canceled' },
      ],
      onFilter: (value: any, record: OrderItem) => record.status === value,
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => <StatusTag status={status} type="payment" />,
      filters: [
        { text: '未支付', value: 'unpaid' },
        { text: '已支付', value: 'paid' },
        { text: '已退款', value: 'refunded' },
      ],
      onFilter: (value: any, record: OrderItem) => record.paymentStatus === value,
    },
    {
      title: '账单状态',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      render: (status: string, record: OrderItem) => {
        if (status === 'billed' && record.billId) {
          return (
            <a onClick={() => history.push(`/order/bill-management/detail/${record.billId}`)}>
              <Tag color="success">账单 #{record.billId}</Tag>
            </a>
          );
        }
        return <StatusTag status={status} type="account" />;
      },
      filters: [
        { text: '未生成账单', value: 'unbilled' },
        { text: '已生成账单', value: 'billed' },
      ],
      onFilter: (value: any, record: OrderItem) => record.accountStatus === value,
    },
    {
      title: '业务数量',
      dataIndex: 'businesses',
      key: 'businessCount',
      render: (businesses: any[]) => {
        const count = businesses && Array.isArray(businesses) ? businesses.length : 0;
        return <Tag color={count > 0 ? 'blue' : 'default'}>{count}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: OrderItem) => (
        <PermissionControl
          anyPermissions={['order:edit', 'order:delete']}
        >
          <Dropdown
            menu={{
              onClick: ({ key }) => handleMenuClick(key, record),
              items: [
                {
                  key: 'edit',
                  label: '编辑',
                  disabled: !access.hasPermission('order:edit'),
                },
                {
                  key: 'delete',
                  label: '删除',
                  disabled: !access.hasPermission('order:delete'),
                },
              ],
            }}
          >
            <a>
              操作 <DownOutlined />
            </a>
          </Dropdown>
        </PermissionControl>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className={styles.standardList}>
        <Card variant="borderless">
          <Row>
            <Col sm={8} xs={24}>
              <Info title="待处理订单" value={`${pendingOrdersCount}个订单`} bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="处理中订单" value={`${processingOrdersCount}个订单`} bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="已完成订单" value={`${completedOrdersCount}个订单`} />
            </Col>
          </Row>
        </Card>

        <Card
          className={styles.listCard}
          bordered={false}
          title="订单列表"
          style={{ marginTop: 24 }}
          styles={{
            body: {
              padding: '0 32px 40px 32px',
            }
          }}
          extra={extraContent}
        >
          <Table 
            rowKey="id"
            loading={loading}
            dataSource={filteredData}
            columns={columns}
            rowSelection={rowSelection}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSize: pageSize,
              current: currentPage,
              total: total,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
              },
            }}
          />
        </Card>
      </div>

      <Modal
        title="选择账单样式"
        open={billStyleModalVisible}
        onOk={confirmCreateBill}
        onCancel={() => setBillStyleModalVisible(false)}
        okText="创建账单"
        cancelText="取消"
        okButtonProps={{ disabled: !selectedTemplateId }}
      >
        <Spin spinning={loadingTemplates}>
          {templates.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={templates}
              renderItem={(item) => (
                <List.Item 
                  actions={[
                    <a 
                      key="select" 
                      onClick={() => setSelectedTemplateId(item.id)}
                      style={{ color: selectedTemplateId === item.id ? '#1890ff' : undefined }}
                    >
                      {selectedTemplateId === item.id ? '已选择' : '选择'}
                    </a>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {item.name}
                        {item.isDefault && <Tag color="blue">默认</Tag>}
                      </Space>
                    }
                    description={`纸张类型: ${item.paperType.toUpperCase()}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              暂无可用的账单样式，请先创建账单样式
            </div>
          )}
        </Spin>
      </Modal>
    </PageContainer>
  );
};

export default OrderList;