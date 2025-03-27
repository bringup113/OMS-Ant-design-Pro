import React, { useEffect, useState, useCallback } from 'react';
import { useParams, history, useModel } from '@umijs/max';
import { 
  message, 
  Spin, 
  Result, 
  Button, 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Typography, 
  Row, 
  Col, 
  Avatar, 
  Input, 
  List, 
  Modal,
  Empty,
  Select
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { getOrderDetail, getOrderComments, addOrderComment, updateBusinessStatus } from '../service';
import type { OrderItem, Comment } from '../data.d';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// 订单状态展示组件
const StatusTag: React.FC<{ status: string; type: 'order' | 'payment' | 'account' }> = ({ status, type }) => {
  let color = 'default';
  let text = '未知';
  
  if (type === 'order') {
    switch (status) {
      case 'pending':
        color = 'warning';
        text = '待处理';
        break;
      case 'processing':
        color = 'processing';
        text = '处理中';
        break;
      case 'completed':
        color = 'success';
        text = '已完成';
        break;
      case 'canceled':
      case 'cancelled':
        color = 'error';
        text = '已取消';
        break;
    }
  } else if (type === 'payment') {
    switch (status) {
      case 'unpaid':
        color = 'warning';
        text = '未支付';
        break;
      case 'paid':
        color = 'success';
        text = '已支付';
        break;
      case 'refunded':
        color = 'error';
        text = '已退款';
        break;
    }
  } else if (type === 'account') {
    switch (status) {
      case 'unbilled':
        color = 'default';
        text = '未生成账单';
        break;
      case 'billed':
        color = 'success';
        text = '已生成账单';
        break;
    }
  }
  
  return <Tag color={color}>{text}</Tag>;
};

const OrderDetail: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { id } = useParams<{ id: string }>();
  const [orderData, setOrderData] = useState<OrderItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [businessLoading, setBusinessLoading] = useState<{[key: number]: boolean}>({});
  const [statusChanges, setStatusChanges] = useState<{[key: number]: string}>({});
  const commentContainerRef = React.useRef<HTMLDivElement>(null);

  // 滚动到消息列表底部
  const scrollToBottom = () => {
    if (commentContainerRef.current) {
      const container = commentContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // 在评论列表更新后滚动到底部
  useEffect(() => {
    if (comments.length > 0) {
      scrollToBottom();
    }
  }, [comments]);

  // 获取订单详情
  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) {
        setError('订单ID无效');
        return;
      }

      const response = await getOrderDetail(Number(id));
      if (response.success && response.data) {
        const orderData = response.data;
        
        // 如果有代理ID但没有代理信息，尝试获取代理详情
        if (orderData.agentId && !orderData.agent) {
          try {
            const agentResponse = await fetch(`/api/agents/${orderData.agentId}`);
            if (agentResponse.ok) {
              const agentData = await agentResponse.json();
              // 更新订单数据中的代理信息
              orderData.agent = agentData;
            }
          } catch (error) {
            console.error('获取代理信息失败:', error);
          }
        }
        
        setOrderData(orderData);
      } else {
        setError('获取订单详情失败: 服务器返回错误');
        message.error('获取订单详情失败: 服务器返回错误');
      }
    } catch (error) {
      console.error('获取订单详情请求异常:', error);
      setError('获取订单详情失败: 请求异常');
      message.error('获取订单详情失败: 请求异常');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 获取评论列表
  const fetchComments = async () => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      const res = await getOrderComments(Number(id));
      if (res.success) {
        setComments(res.data || []);
      } else {
        message.error('获取评论失败');
      }
    } catch (error) {
      console.error('获取评论出错：', error);
      message.error('获取评论出错');
    } finally {
      setCommentsLoading(false);
    }
  };
  
  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      message.warning('评论内容不能为空');
      return;
    }
    
    setLoading(true);
    try {
      const res = await addOrderComment(Number(id), commentContent);
      if (res.success) {
        message.success('评论添加成功');
        setCommentContent('');
        await fetchComments(); // 重新获取评论列表
        // 添加短暂延迟确保DOM更新后再滚动
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        message.error('评论添加失败');
      }
    } catch (error) {
      console.error('评论添加出错：', error);
      message.error('评论添加出错');
    } finally {
      setLoading(false);
    }
  };

  // 更新业务状态
  const handleBusinessStatusChange = async (businessId: number, newStatus: string) => {
    if (!id) {
      message.error('订单ID无效');
      return;
    }
    
    // 查找当前业务，检查状态是否已经相同
    const currentBusiness = orderData?.businesses?.find(b => b.id === businessId);
    if (currentBusiness && currentBusiness.status === newStatus) {
      message.info(`业务状态已经是"${newStatus === 'completed' ? '已完成' : 
                     newStatus === 'processing' ? '处理中' : 
                     newStatus === 'pending' ? '待处理' : newStatus}"`);
                     
      // 清除此业务的状态变更记录
      setStatusChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[businessId];
        return newChanges;
      });
      
      return;
    }

    // 设置对应业务的加载状态
    setBusinessLoading(prev => ({ ...prev, [businessId]: true }));
    
    try {
      // 调用API更新状态
      const response = await updateBusinessStatus(Number(id), businessId, newStatus);
      
      // 清除此业务的状态变更记录
      setStatusChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[businessId];
        return newChanges;
      });
      
      if (response.success) {
        if (response.message === '业务状态未变更') {
          message.info('业务状态未变更');
        } else {
          message.success(response.message || '业务状态更新成功');
          // 重新获取订单详情以刷新数据
          fetchOrderDetail();
        }
      } else {
        message.error(response.message || '业务状态更新失败');
      }
    } catch (error) {
      console.error('更新业务状态异常:', error);
      message.error('业务状态更新失败');
    } finally {
      // 清除对应业务的加载状态
      setBusinessLoading(prev => ({ ...prev, [businessId]: false }));
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
      fetchComments();
    }
  }, [id]);

  // 业务数据表格列定义
  const businessColumns = [
    {
      title: '产品名称',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (text: string, record: any) => text || '未知产品',
    },
    {
      title: '供应商',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      render: (text: string, record: any) => text || '未知供应商',
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (text: string) => `$${text || '0.00'}`,
    },
    {
      title: '代理价',
      dataIndex: 'agentPrice',
      key: 'agentPrice',
      render: (text: string) => text ? `$${text}` : '-',
    },
    {
      title: '销售价',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (text: string) => `$${text || '0.00'}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        const statusOptions = [
          { value: 'pending', label: '待处理', color: 'warning' },
          { value: 'processing', label: '处理中', color: 'processing' },
          { value: 'completed', label: '已完成', color: 'success' },
          { value: 'cancelled', label: '已取消', color: 'error' }
        ];
        
        // 获取当前选项的颜色
        const currentOption = statusOptions.find(opt => opt.value === status);
        
        // 获取当前业务已选择的待更新状态
        const pendingStatus = statusChanges[record.id];
        
        // 确定下拉框的样式
        const selectStyle: React.CSSProperties = {
          width: 120,
          border: pendingStatus ? '1px solid #faad14' : undefined,
          backgroundColor: pendingStatus ? '#fffbe6' : undefined,
        };
        
        // 处理选择状态变化
        const handleChange = (value: string) => {
          // 如果选择的值与当前状态相同，则清除变更
          if (value === status) {
            setStatusChanges(prev => {
              const newChanges = { ...prev };
              delete newChanges[record.id];
              return newChanges;
            });
            return;
          }
          
          // 弹出确认对话框
          Modal.confirm({
            title: '确认修改状态',
            content: `确定要将业务状态从"${currentOption?.label || status}"修改为"${
              statusOptions.find(opt => opt.value === value)?.label || value
            }"吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => handleBusinessStatusChange(record.id, value),
            onCancel: () => {
              // 取消时清除选择
              setStatusChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[record.id];
                return newChanges;
              });
            }
          });
          
          // 记录新的状态变更
          setStatusChanges(prev => ({ ...prev, [record.id]: value }));
        };
        
        return (
          <Select
            style={selectStyle}
            placeholder="选择状态"
            options={statusOptions}
            onChange={handleChange}
            loading={businessLoading[record.id]}
            value={pendingStatus || status}
            status={pendingStatus ? 'warning' : undefined}
          />
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text: string) => text || '-',
    },
  ];

  return (
    <PageContainer
      onBack={() => history.push('/order/order-list')}
      title={`订单详情 #${id}`}
      extra={[
        <Button key="edit" icon={<EditOutlined />} onClick={() => history.push(`/order/order-list/edit/${id}`)}>
          编辑
        </Button>,
        <Button key="back" onClick={() => history.push('/order/order-list')}>
          返回列表
        </Button>,
      ]}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" tip="正在加载订单详情..." />
        </div>
      ) : error ? (
        <Result
          status="error"
          title="加载出错"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => history.push('/order/order-list')}>
              返回订单列表
            </Button>
          }
        />
      ) : !orderData ? (
        <Result
          status="warning"
          title="订单不存在或数据为空"
          extra={
            <Button type="primary" onClick={() => history.push('/order/order-list')}>
              返回订单列表
            </Button>
          }
        />
      ) : (
        <div className="order-detail-container">
          <Row gutter={16}>
            <Col span={18} style={{ display: 'flex', flexDirection: 'column' }}> {/* 左侧区域占75% */}
              {/* 订单基本信息 */}
              <Card 
                title={<span><Text strong>订单信息</Text></span>} 
                style={{ marginBottom: 24 }}
              >
                <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                  <Descriptions.Item label="订单编号">#{orderData.id}</Descriptions.Item>
                  <Descriptions.Item label="订单状态">
                    <StatusTag status={orderData.status} type="order" />
                  </Descriptions.Item>
                  <Descriptions.Item label="支付状态">
                    <StatusTag status={orderData.paymentStatus} type="payment" />
                  </Descriptions.Item>
                  <Descriptions.Item label="账本状态">
                    {orderData.accountStatus === 'billed' ? 
                      <span>
                        <StatusTag status={orderData.accountStatus} type="account" />
                        {orderData.accountBook ? ` (${orderData.accountBook.name})` : ''}
                      </span> :
                      <StatusTag status={orderData.accountStatus} type="account" />
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="客户姓名">{orderData.customer?.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="护照号">{orderData.customer?.passportNo || '-'}</Descriptions.Item>
                  <Descriptions.Item label="性别">{orderData.customer?.gender === 'male' ? '男' : orderData.customer?.gender === 'female' ? '女' : '-'}</Descriptions.Item>
                  <Descriptions.Item label="国籍">{orderData.customer?.country || '-'}</Descriptions.Item>
                  <Descriptions.Item label="订单总金额">${orderData.totalAmount}</Descriptions.Item>
                  <Descriptions.Item label="代理">
                    {orderData.agent?.name || (orderData.agentId ? `等待加载代理信息...` : '无代理')}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {orderData.createdAt ? dayjs(orderData.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {orderData.updatedAt ? dayjs(orderData.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                  {orderData.remark && (
                    <Descriptions.Item label="备注" span={2}>
                      {orderData.remark}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* 业务信息表格 */}
              <Card 
                title={<span><Text strong>业务信息</Text> <Text type="secondary">({orderData.businesses?.length || 0}个业务)</Text></span>}
                style={{ flex: 1 }}
              >
                <Table
                  rowKey="id"
                  dataSource={orderData.businesses || []}
                  columns={businessColumns}
                  pagination={false}
                  bordered
                  locale={{ emptyText: '暂无业务数据' }}
                />
              </Card>
            </Col>
            
            <Col span={6} style={{ display: 'flex', flexDirection: 'column' }}> {/* 右侧区域占25% */}
              {/* 消息板 */}
              <Card 
                title="消息记录" 
                style={{ marginTop: 24 }}
                loading={commentsLoading}
                bordered={false}
              >
                <div 
                  ref={commentContainerRef}
                  style={{ height: 400, overflowY: 'auto', marginBottom: 16 }}
                >
                  {comments.length === 0 ? (
                    <Empty description="暂无消息记录" />
                  ) : (
                    <List
                      itemLayout="horizontal"
                      dataSource={comments}
                      renderItem={(item) => {
                        // @ts-ignore - CurrentUser类型定义与实际不符
                        const isCurrentUser = item.createdBy === Number(initialState?.currentUser?.userid);
                        
                        return (
                          <List.Item style={{ 
                            padding: '8px 0',
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                              maxWidth: '80%'
                            }}>
                              <Avatar
                                style={{ 
                                  marginLeft: isCurrentUser ? 8 : 0,
                                  marginRight: isCurrentUser ? 0 : 8,
                                  background: isCurrentUser ? '#1890ff' : '#f56a00'
                                }}
                              >
                                {item.createdByUser?.name?.charAt(0) || 'U'}
                              </Avatar>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                              }}>
                                <div style={{ 
                                  fontSize: 12,
                                  color: '#8c8c8c',
                                  marginBottom: 4
                                }}>
                                  <span style={{ marginRight: 8 }}>
                                    {item.createdByUser?.name || '未知用户'}
                                  </span>
                                  <span>
                                    {dayjs(item.createdAt).format('MM-DD HH:mm')}
                                  </span>
                                </div>
                                <div style={{
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  backgroundColor: isCurrentUser ? '#e6f7ff' : '#f5f5f5',
                                  borderTopRightRadius: isCurrentUser ? 2 : 8,
                                  borderTopLeftRadius: isCurrentUser ? 8 : 2,
                                  wordBreak: 'break-word'
                                }}>
                                  {item.content}
                                </div>
                              </div>
                            </div>
                          </List.Item>
                        );
                      }}
                    />
                  )}
                </div>
                <div style={{ display: 'flex' }}>
                  <Input.TextArea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="请输入消息内容"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="primary"
                    onClick={handleSubmitComment}
                    loading={loading}
                    style={{ marginLeft: 8, height: 'auto' }}
                  >
                    发送
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </PageContainer>
  );
};

export default OrderDetail; 