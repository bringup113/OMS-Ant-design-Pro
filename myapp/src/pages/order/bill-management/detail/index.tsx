import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, history } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, message, Space, Spin, Descriptions, Divider, Typography, Row, Col, Tabs, Table, Tag, Statistic } from 'antd';
import { PrinterOutlined, ArrowLeftOutlined, RollbackOutlined } from '@ant-design/icons';
import BillTemplate from '../../../bill/print-template';
import { getBillDetail, getBillOrders, getAgentById } from '../service';
import { getBillStyleTemplates } from '../../order-list/service';
import dayjs from 'dayjs';
import PaymentTab from './PaymentTab';

const { Title, Text } = Typography;

// 使用URLSearchParams解析查询参数
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// 账单详情页
const BillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const query = useQuery();
  const activeTab = query.get('tab') || 'info';
  
  const [billDetail, setBillDetail] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [template, setTemplate] = useState<any>(null);
  const [agentName, setAgentName] = useState<string>('');
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const printContentRef = useRef<HTMLDivElement>(null);

  // 获取账单详情和关联的订单数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取账单详情
      const billResponse = await getBillDetail(Number(id));
      if (billResponse) {
        setBillDetail(billResponse);
        
        // 如果有代理ID，获取代理名称
        if (billResponse.agentId) {
          const agentData = await getAgentById(billResponse.agentId);
          if (agentData && agentData.name) {
            setAgentName(agentData.name);
          }
        }
        
        // 获取账单关联的订单详情
        const ordersResponse = await getBillOrders(Number(id));
        if (Array.isArray(ordersResponse)) {
          setOrders(ordersResponse);
        }
        
        // 获取账单样式模板
        if (billResponse.templateId) {
          try {
            // 获取所有模板
            const templates = await getBillStyleTemplates();
            if (Array.isArray(templates)) {
              // 查找匹配的模板
              const matchedTemplate = templates.find(t => t.id === billResponse.templateId);
              if (matchedTemplate) {
                setTemplate(matchedTemplate);
              }
            }
          } catch (error) {
            console.error('获取账单样式模板失败:', error);
          }
        }
      }
    } catch (error) {
      console.error('获取账单详情失败:', error);
      message.error('获取账单详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 处理标签页切换
  const handleTabChange = (activeKey: string) => {
    history.replace(`/order/bill-management/detail/${id}?tab=${activeKey}`);
  };

  // 订单表格列定义
  const orderColumns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      render: (orderId: number) => (
        <a onClick={() => history.push(`/order/order-list/detail/${orderId}`)}>
          订单 #{orderId}
        </a>
      ),
    },
    {
      title: '客户',
      key: 'customer',
      render: (_: any, record: any) => record.customer?.name || '未知',
    },
    {
      title: '护照号',
      key: 'passportNo',
      render: (_: any, record: any) => record.customer?.passportNo || '-',
    },
    {
      title: '业务数量',
      key: 'businessCount',
      render: (_: any, record: any) => (record.businesses?.length || 0),
    },
    {
      title: '订单金额',
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
  ];

  const renderStatusTag = (status: string) => {
    let color = 'default';
    let text = '未知状态';
    
    switch (status) {
      case 'paid':
        color = 'success';
        text = '已结算';
        break;
      case 'partially_paid':
        color = 'processing';
        text = '部分结算';
        break;
      case 'unpaid':
        color = 'warning';
        text = '未结算';
        break;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  // 返回账单列表
  const goBack = () => {
    history.push('/order/bill-management');
  };

  // 使用iframe打印账单
  const handlePrint = () => {
    if (!printFrameRef.current) return;
    
    const iframe = printFrameRef.current;
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;
    
    // 获取要打印的内容
    const printContent = document.getElementById('bill-template-content');
    if (!printContent) return;
    
    // 设置iframe内容
    iframe.style.display = 'block';
    iframeWindow.document.open();
    iframeWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>打印账单</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: "Microsoft YaHei", "微软雅黑", "SimSun", "宋体", sans-serif;
              font-size: 12px;
            }
            .print-container {
              width: 180mm;
              margin: 0 auto;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            th, td {
              border: 1px solid #e8e8e8;
              padding: 8px;
              font-size: 12px;
              text-align: center;
              word-break: break-word;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 13px;
            }
            td[rowspan] {
              background-color: #f9f9f9;
            }
            h1 {
              font-size: 18px;
              text-align: center;
              margin-bottom: 10px;
            }
            h2 {
              font-size: 16px;
              margin: 10px 0;
            }
            p {
              font-size: 12px;
              margin: 5px 0;
            }
            .header {
              margin-bottom: 10px;
            }
            .agent-info {
              margin: 10px 0;
            }
            .section-title {
              text-align: center;
              font-weight: bold;
              margin: 15px 0 10px;
              font-size: 14px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
            }
            .total-row td {
              font-weight: bold;
              text-align: right;
            }
            .price-cell {
              text-align: right !important;
              padding-right: 15px !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeWindow.document.close();
    
    // 等待图片加载完成再打印
    setTimeout(() => {
      iframeWindow.focus();
      iframeWindow.print();
      iframe.style.display = 'none';
    }, 500);
  };

  // 渲染有样式的账单或默认账单
  const renderBillTemplate = () => {
    // 如果有指定的模板且模板数据已加载，使用它，否则使用默认模板
    if (template) {
      console.log('使用自定义模板渲染账单:', template);
      return (
        <BillTemplate
          companyName="天成旅行社"
          billId={billDetail.id}
          billDate={dayjs(billDetail.createdAt).format('YYYY-MM-DD')}
          agentName={agentName} // 使用获取到的代理名称
          orders={orders}
          totalAmount={Number(billDetail.totalAmount)}
          remark={billDetail.remark}
          templateData={template}
        />
      );
    }
    
    // 默认账单模板
    return (
      <BillTemplate
        companyName="天成旅行社"
        billId={billDetail.id}
        billDate={dayjs(billDetail.createdAt).format('YYYY-MM-DD')}
        agentName={agentName} // 使用获取到的代理名称
        orders={orders}
        totalAmount={Number(billDetail.totalAmount)}
        remark={billDetail.remark}
      />
    );
  };

  return (
    <PageContainer
      header={{
        title: `账单详情 #${id}`,
        onBack: goBack,
      }}
    >
      <Spin spinning={loading}>
        {billDetail ? (
          <>
            <Card
              title="账单信息"
              extra={
                <Space>
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                  >
                    打印账单
                  </Button>
                  <Button
                    icon={<RollbackOutlined />}
                    onClick={goBack}
                  >
                    返回列表
                  </Button>
                </Space>
              }
            >
              <Descriptions column={3}>
                <Descriptions.Item label="账单编号">#{billDetail.id}</Descriptions.Item>
                <Descriptions.Item label="创建日期">{dayjs(billDetail.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="总金额">${billDetail.totalAmount}</Descriptions.Item>
                <Descriptions.Item label="代理">{agentName || '无代理'}</Descriptions.Item>
                <Descriptions.Item label="状态">{renderStatusTag(billDetail.status)}</Descriptions.Item>
                <Descriptions.Item label="订单数量">{orders.length}</Descriptions.Item>
                {billDetail.templateId && (
                  <Descriptions.Item label="账单样式">{template?.name || `模板 #${billDetail.templateId}`}</Descriptions.Item>
                )}
              </Descriptions>

              {billDetail.remark && (
                <>
                  <Divider />
                  <Descriptions>
                    <Descriptions.Item label="备注">{billDetail.remark}</Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </Card>

            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange} 
              style={{ marginTop: 16 }}
              items={[
                {
                  key: 'info',
                  label: '账单信息',
                  children: (
                    <Card title="关联订单">
                      <Table
                        rowKey="id"
                        columns={orderColumns}
                        dataSource={orders}
                        pagination={false}
                      />
                    </Card>
                  )
                },
                {
                  key: 'payments',
                  label: '付款记录',
                  children: (
                    <PaymentTab 
                      billId={Number(id)} 
                      billTotalAmount={billDetail.totalAmount}
                      onPaymentChange={fetchData}
                    />
                  )
                },
                {
                  key: 'print',
                  label: '预览打印',
                  children: (
                    <Card>
                      <div style={{ maxWidth: '160mm', margin: '0 auto' }}>
                        {renderBillTemplate()}
                      </div>
                    </Card>
                  )
                }
              ]}
            />

            {/* 打印iframe */}
            <iframe 
              ref={printFrameRef}
              style={{ 
                display: 'none', 
                width: '0', 
                height: '0',
                position: 'absolute' 
              }}
              title="打印预览"
            />
          </>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              {loading ? '正在加载账单信息...' : '账单信息不存在或已被删除'}
            </div>
          </Card>
        )}
      </Spin>
    </PageContainer>
  );
};

export default BillDetail; 