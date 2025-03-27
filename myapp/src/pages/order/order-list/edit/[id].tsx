import React, { useEffect, useState } from 'react';
import { useParams, history } from '@umijs/max';
import { message, Spin, Result, Button, Card } from 'antd';
import { request } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import OrderForm from '../components/OrderForm';

const EditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取订单详情
  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('正在获取订单详情, ID:', id);
        const response = await request(`/api/orders/${id}`);
        console.log('获取到的原始订单详情响应:', response);
        
        if (response && response.success) {
          // 处理数据以适配表单格式
          const orderData = response.data;
          console.log('获取到的订单详情数据:', orderData);
          
          // 确保业务数据格式正确
          let businessList: any[] = [];
          if (orderData.businesses && Array.isArray(orderData.businesses)) {
            console.log('原始业务数据:', orderData.businesses);
            businessList = orderData.businesses.map((biz: any, index: number) => {
              console.log(`处理业务数据项 #${index}:`, biz);
              // 确保每个业务数据都有唯一ID
              const bizId = biz.id ? biz.id.toString() : `temp-${Date.now()}-${index}`;
              console.log(`为业务数据项 #${index} 分配ID:`, bizId);
              
              return {
                id: bizId,
                productId: biz.productId,
                supplierId: biz.supplierId,
                costPrice: biz.costPrice,
                agentPrice: biz.agentPrice,
                salePrice: biz.salePrice,
                status: biz.status || 'pending',
                remark: biz.remark,
                // 添加产品和供应商名称以便显示
                productName: biz.product?.name || '未知产品',
                supplierName: biz.supplier?.name || '未知供应商',
                // 添加原始对象引用以便调试
                _original: biz
              };
            });
          } else {
            console.warn('订单没有业务数据或业务数据格式不正确:', orderData.businesses);
          }
          console.log('处理后的业务数据:', businessList);
            
          const formData = {
            ...orderData,
            customerId: orderData.customerId,
            passportNo: orderData.customer?.passportNo,
            name: orderData.customer?.name,
            gender: orderData.customer?.gender,
            birthDate: orderData.customer?.birthDate,
            country: orderData.customer?.country,
            passportIssueDate: orderData.customer?.issueDate,
            passportExpiryDate: orderData.customer?.expiryDate,
            // 添加业务数据
            businessDataSource: businessList,
          };
          
          console.log('最终表单数据:', formData);
          setInitialValues(formData);
        } else {
          console.error('获取订单详情响应不成功:', response);
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
    };

    if (id) {
      fetchOrderDetail();
    } else {
      setError('订单ID无效');
      setLoading(false);
    }
  }, [id]);

  // 处理表单提交
  const handleFinish = async (values: any) => {
    try {
      console.log('提交的表单数据:', values);
      
      // 调用OrderForm中的onFinish处理表单数据
      // 由于OrderForm组件已处理了表单提交，这里仅需处理成功回调
      
      message.success('订单更新成功');
      history.push('/order/order-list');
    } catch (error) {
      console.error('更新订单失败:', error);
      message.error('更新订单失败');
    }
  };

  // 处理成功回调
  const handleSuccess = () => {
    message.success('订单更新成功');
    history.push('/order/order-list');
  };

  // 处理关闭回调
  const handleClose = () => {
    history.push('/order/order-list');
  };

  return (
    <PageContainer>
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
      ) : !initialValues ? (
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
        <Card>
          <OrderForm 
            initialValues={initialValues} 
            closeModal={handleClose}
            onSuccess={handleSuccess}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default EditOrder; 