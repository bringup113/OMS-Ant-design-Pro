import {
  PageContainer,
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  StepsForm,
  ProFormRadio,
  ProFormTextArea,
  ProCard,
} from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { Alert, Button, Card, Descriptions, Divider, Result, Typography, Space, message, Row, Col, Spin } from 'antd';
import React, { useRef, useState, useMemo } from 'react';
import type { CustomerDataType, VisaDataType } from './data.d';
import useStyles from './style.style';
import moment from 'moment';
import dayjs from 'dayjs';
import { history, request, useRequest } from '@umijs/max';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { createCustomer, batchCreateVisas } from '@/services/system/customer';
import VisaForm from './components/VisaForm';

const { Text } = Typography;

const StepDescriptions: React.FC<{
  stepData: CustomerDataType;
  bordered?: boolean;
  column?: number;
}> = ({ stepData, bordered, column }) => {
  const { passportNo, name, gender, country, birthDate, issueDate, expiryDate } = stepData;
  return (
    <Descriptions column={column || 1} bordered={bordered} style={{ width: '100%' }}>
      <Descriptions.Item label="护照号码">{passportNo}</Descriptions.Item>
      <Descriptions.Item label="客户姓名">{name}</Descriptions.Item>
      <Descriptions.Item label="性别">{gender === 'male' ? '男' : '女'}</Descriptions.Item>
      <Descriptions.Item label="国家">{country}</Descriptions.Item>
      <Descriptions.Item label="出生日期">{birthDate ? moment(birthDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
      <Descriptions.Item label="护照签发日期">{issueDate ? moment(issueDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
      <Descriptions.Item label="护照到期日期">{expiryDate ? moment(expiryDate).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
    </Descriptions>
  );
};

const StepResult: React.FC<{
  onFinish: () => Promise<void>;
  children?: React.ReactNode;
}> = (props) => {
  const { styles } = useStyles();
  return (
    <Result
      status="success"
      title="客户创建成功"
      subTitle="客户信息已成功保存到系统中"
      extra={
        <>
          <Button type="primary" onClick={props.onFinish}>
            继续添加
          </Button>
          <Button onClick={() => history.push('/customer')}>查看客户列表</Button>
        </>
      }
      className={styles.result}
    >
      {props.children}
    </Result>
  );
};

const CreateCustomer: React.FC = () => {
  const { styles } = useStyles();
  const [stepData, setStepData] = useState<CustomerDataType>({
    passportNo: '',
    name: '',
    gender: '',
    country: '',
    birthDate: null,
    issueDate: null,
    expiryDate: null,
  });
  const [current, setCurrent] = useState(0);
  const formRef = useRef<FormInstance>();
  const [saving, setSaving] = useState<boolean>(false);
  
  // 保存客户基本信息并返回
  const saveCustomerAndReturn = async () => {
    try {
      // 验证表单
      const values = await formRef.current?.validateFields();
      if (!values) return;
      
      // 提交基本信息
      const customerData = {
        name: values.name,
        passportNo: values.passportNo,
        gender: values.gender,
        country: values.country,
        birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
        issueDate: values.passportValidityPeriod?.[0] ? dayjs(values.passportValidityPeriod[0]).format('YYYY-MM-DD') : null,
        expiryDate: values.passportValidityPeriod?.[1] ? dayjs(values.passportValidityPeriod[1]).format('YYYY-MM-DD') : null,
      };
      
      const response = await request('/api/customers', {
        method: 'POST',
        data: customerData,
      });
      
      if (response.success) {
        message.success('客户创建成功');
        history.push('/customer');
      } else {
        message.error('客户创建失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 保存客户基本信息和签证信息
  const saveCustomerAndVisas = async (visaData: VisaDataType[]) => {
    try {
      setSaving(true);
      console.log('开始保存客户和签证信息');
      
      // 验证签证数据
      if (!visaData || visaData.length === 0) {
        message.warning('请至少添加一条有效的签证信息');
        setSaving(false);
        return false;
      }
      
      console.log('接收到的签证数据:', visaData);
      
      // 提交客户基本信息
      const customerData = {
        name: stepData.name,
        passportNo: stepData.passportNo,
        gender: stepData.gender,
        country: stepData.country,
        birthDate: stepData.birthDate ? dayjs(stepData.birthDate).format('YYYY-MM-DD') : null,
        issueDate: stepData.issueDate ? dayjs(stepData.issueDate).format('YYYY-MM-DD') : null,
        expiryDate: stepData.expiryDate ? dayjs(stepData.expiryDate).format('YYYY-MM-DD') : null,
      };
      
      console.log('提交客户数据:', customerData);
      const customerResponse = await createCustomer(customerData);
      console.log('客户创建响应:', customerResponse);
      
      if (customerResponse.success && customerResponse.data) {
        const customerId = customerResponse.data.id;
        console.log('获取到客户ID:', customerId);
        
        // 格式化签证数据
        const formattedVisaData = visaData.map(item => ({
          country: item.country,
          visaName: item.visaName,
          issueDate: item.issueDate ? dayjs(item.issueDate).format('YYYY-MM-DD') : null,
          expiryDate: item.expiryDate ? dayjs(item.expiryDate).format('YYYY-MM-DD') : null,
        }));
        
        console.log('准备提交的签证数据:', formattedVisaData);
        
        try {
          // 直接使用fetch API提交数据
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/customers/${customerId}/visas/batch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(formattedVisaData),
          });
          
          const visaResponse = await response.json();
          console.log('签证创建响应:', visaResponse);
          
          if (visaResponse.success) {
            message.success('客户和签证信息创建成功');
          } else {
            console.error('签证保存失败:', visaResponse);
            message.warning('客户创建成功，但签证信息保存失败');
          }
        } catch (error) {
          console.error('签证提交失败:', error);
          message.warning('客户创建成功，但签证信息保存失败');
        }
        
        setSaving(false);
        setCurrent(2);
        return true;
      } else {
        console.error('客户创建失败:', customerResponse);
        message.error('客户创建失败');
        setSaving(false);
        return false;
      }
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
      setSaving(false);
      return false;
    }
  };

  return (
    <PageContainer content="填写客户的护照信息，完成基本信息的建档。也可以快速添加多个签证信息与订单信息。">
      <Card variant="borderless" styles={{ body: {} }}>
        <StepsForm
          current={current}
          onCurrentChange={(newCurrent) => {
            setCurrent(newCurrent);
          }}
          submitter={{
            render: (props) => {
              if (props.step === 0) {
                return (
                  <Space>
                    <Button type="primary" onClick={() => props.onSubmit?.()}>
                      下一步
                    </Button>
                    <Button type="primary" onClick={saveCustomerAndReturn}>
                      保存返回
                    </Button>
                  </Space>
                );
              }
              
              return null;
            },
          }}
        >
          <StepsForm.StepForm
            name="base"
            title="客户基本信息"
            formRef={formRef}
            onFinish={async (values) => {
              setStepData(values as CustomerDataType);
              return true;
            }}
          >
            <div style={{ padding: '24px 0' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12}>
                  <ProFormText
                    label="护照号码"
                    name="passportNo"
                    placeholder="请输入护照号码"
                    rules={[{ required: true, message: '请输入护照号码' }]}
                    fieldProps={{
                      size: 'large',
                    }}
                  />
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <ProFormText
                    label="客户姓名"
                    name="name"
                    placeholder="请输入客户姓名"
                    rules={[{ required: true, message: '请输入客户姓名' }]}
                    fieldProps={{
                      size: 'large',
                    }}
                  />
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={24} md={8}>
                  <ProFormRadio.Group
                    label="性别"
                    name="gender"
                    options={[
                      { label: '男', value: 'male' },
                      { label: '女', value: 'female' },
                    ]}
                    rules={[{ required: true, message: '请选择性别' }]}
                    fieldProps={{
                      size: 'large',
                    }}
                  />
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <ProFormText
                    label="国家"
                    name="country"
                    placeholder="请输入国家"
                    rules={[{ required: true, message: '请输入国家' }]}
                    fieldProps={{
                      size: 'large',
                    }}
                  />
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <ProFormDatePicker
                    label="出生日期"
                    name="birthDate"
                    fieldProps={{
                      format: 'YYYY-MM-DD',
                      size: 'large',
                      style: { width: '100%' },
                    }}
                    transform={(value: any) => {
                      return {
                        birthDate: value ? dayjs(value).format('YYYY-MM-DD') : null,
                      };
                    }}
                  />
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <ProFormDateRangePicker
                    label="护照有效期"
                    name="passportValidityPeriod"
                    fieldProps={{
                      format: 'YYYY-MM-DD',
                      size: 'large',
                      style: { width: '100%' },
                    }}
                    transform={([issueDate, expiryDate]: any[]) => {
                      return {
                        issueDate: issueDate ? dayjs(issueDate).format('YYYY-MM-DD') : null,
                        expiryDate: expiryDate ? dayjs(expiryDate).format('YYYY-MM-DD') : null,
                      };
                    }}
                  />
                </Col>
              </Row>
            </div>
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="visa"
            title="签证信息"
          >
            <VisaForm 
              customerName={stepData.name}
              passportNo={stepData.passportNo}
              onSave={saveCustomerAndVisas}
              loading={saving}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="result"
            title="完成"
          >
            <StepResult
              onFinish={async () => {
                setCurrent(0);
                formRef.current?.resetFields();
              }}
            >
              {/* 卡片内容已移除 */}
            </StepResult>
          </StepsForm.StepForm>
        </StepsForm>
      </Card>
    </PageContainer>
  );
};

export default CreateCustomer;
