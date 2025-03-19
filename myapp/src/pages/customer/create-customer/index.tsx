import {
  PageContainer,
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  StepsForm,
  EditableProTable,
  ProColumns,
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
import { createCustomer } from '@/services/system/customer';

const { Text } = Typography;

const StepDescriptions: React.FC<{
  stepData: CustomerDataType;
  bordered?: boolean;
  column?: number;
}> = ({ stepData, bordered, column }) => {
  const { passportNo, name, gender, country, birthDate, issueDate, expiryDate } = stepData;
  return (
    <Descriptions column={column || 1} bordered={bordered}>
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
  
  // 签证信息表格相关状态
  const defaultRowKey = Date.now();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([defaultRowKey]);
  const [visaDataSource, setVisaDataSource] = useState<VisaDataType[]>([
    {
      id: defaultRowKey,
      country: '',
      visaName: '',
      issueDate: null,
      expiryDate: null,
    }
  ]);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // 签证信息表格列定义
  const visaColumns: ProColumns<VisaDataType>[] = [
    {
      title: '国家',
      dataIndex: 'country',
      valueType: 'text',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
    },
    {
      title: '签证名称',
      dataIndex: 'visaName',
      valueType: 'text',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
    },
    {
      title: '签发日期',
      dataIndex: 'issueDate',
      valueType: 'date',
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      valueType: 'date',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_: any, record: VisaDataType, __: any, action: any) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            setVisaDataSource(visaDataSource.filter((item) => item.id !== record.id));
          }}
        >
          删除
        </a>,
      ],
    },
  ];

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
  const saveCustomerAndVisas = async () => {
    try {
      // 先提交基本信息，获取客户ID
      const customerData = {
        name: stepData.name,
        passportNo: stepData.passportNo,
        gender: stepData.gender,
        country: stepData.country,
        birthDate: stepData.birthDate ? dayjs(stepData.birthDate).format('YYYY-MM-DD') : null,
        issueDate: stepData.issueDate ? dayjs(stepData.issueDate).format('YYYY-MM-DD') : null,
        expiryDate: stepData.expiryDate ? dayjs(stepData.expiryDate).format('YYYY-MM-DD') : null,
      };
      
      const customerResponse = await request('/api/customers', {
        method: 'POST',
        data: customerData,
      });
      
      if (customerResponse.success && customerResponse.data) {
        const customerId = customerResponse.data.id;
        
        // 提交签证信息
        const visaData = visaDataSource.filter(item => item.country && item.visaName).map(item => ({
          customerId,
          country: item.country,
          visaName: item.visaName,
          issueDate: item.issueDate ? dayjs(item.issueDate).format('YYYY-MM-DD') : null,
          expiryDate: item.expiryDate ? dayjs(item.expiryDate).format('YYYY-MM-DD') : null,
        }));
        
        if (visaData.length > 0) {
          await request(`/api/customers/${customerId}/visas/batch`, {
            method: 'POST',
            data: visaData,
          });
        }
        
        message.success('客户创建成功');
        setCurrent(2);
        return true;
      } else {
        message.error('客户创建失败');
        return false;
      }
    } catch (error) {
      message.error('操作失败');
      return false;
    }
  };

  return (
    <PageContainer content="填写客户的护照信息，完成基本信息的建档。也可以快速添加多个签证信息与订单信息。">
      <Card bordered={false}>
        <StepsForm
          current={current}
          onCurrentChange={(newCurrent) => {
            setCurrent(newCurrent);
            // 进入第二步时，确保默认行处于编辑状态
            if (newCurrent === 1 && visaDataSource.length > 0) {
              setEditableRowKeys(visaDataSource.map(item => item.id));
            }
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
              
              if (props.step === 1) {
                return (
                  <Button type="primary" onClick={saveCustomerAndVisas}>
                    保存
                  </Button>
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
            <div style={{ marginBottom: 24 }}>
              <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <div>
                  <Text strong style={{ fontSize: 30 }}>{stepData.name}</Text>
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>{stepData.passportNo}</Text>
                </div>
                <Alert
                  message="请填写客户的签证信息，可以添加多个签证记录。"
                  type="info"
                  showIcon
                />
                <EditableProTable<VisaDataType>
                  rowKey="id"
                  headerTitle="签证信息"
                  maxLength={10}
                  columns={visaColumns}
                  recordCreatorProps={{
                    newRecordType: 'dataSource',
                    record: () => ({
                      id: Date.now(),
                      country: '',
                      visaName: '',
                      issueDate: null,
                      expiryDate: null,
                    }),
                    creatorButtonText: '添加签证信息',
                  }}
                  value={visaDataSource}
                  onChange={(value) => {
                    setVisaDataSource(value as VisaDataType[]);
                  }}
                  editable={{
                    type: 'multiple',
                    editableKeys,
                    onChange: setEditableRowKeys,
                    actionRender: (row, config, defaultDoms) => {
                      return [defaultDoms.delete];
                    },
                  }}
                />
              </Space>
            </div>
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name="result"
            title="完成"
          >
            <StepResult
              onFinish={async () => {
                setCurrent(0);
                formRef.current?.resetFields();
                const newDefaultRowKey = Date.now();
                setVisaDataSource([
                  {
                    id: newDefaultRowKey,
                    country: '',
                    visaName: '',
                    issueDate: null,
                    expiryDate: null,
                  }
                ]);
                setEditableRowKeys([newDefaultRowKey]);
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
