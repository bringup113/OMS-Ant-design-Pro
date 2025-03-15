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
} from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { Alert, Button, Card, Descriptions, Divider, Result, Typography, Space } from 'antd';
import React, { useRef, useState } from 'react';
import type { CustomerDataType, VisaDataType } from './data.d';
import useStyles from './style.style';
import moment from 'moment';

const { Text } = Typography;

const StepDescriptions: React.FC<{
  stepData: CustomerDataType;
  bordered?: boolean;
}> = ({ stepData, bordered }) => {
  const { passportNo, name, gender, country, birthDate, issueDate, expiryDate } = stepData;
  return (
    <Descriptions column={1} bordered={bordered}>
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
          <Button>查看客户列表</Button>
        </>
      }
      className={styles.result}
    >
      {props.children}
    </Result>
  );
};

const CreateCustomer: React.FC<Record<string, any>> = () => {
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
      visaType: '',
      visaName: '',
      issueDate: null,
      expiryDate: null,
    }
  ]);
  
  // 签证信息表格列定义
  const visaColumns: ProColumns<VisaDataType>[] = [
    {
      title: '国家',
      dataIndex: 'country',
      valueType: 'select',
      valueEnum: {
        china: '中国',
        usa: '美国',
        uk: '英国',
        japan: '日本',
        korea: '韩国',
        france: '法国',
        germany: '德国',
        italy: '意大利',
        russia: '俄罗斯',
        canada: '加拿大',
        australia: '澳大利亚',
        newZealand: '新西兰',
      },
    },
    {
      title: '签证类型',
      dataIndex: 'visaType',
      valueType: 'select',
      valueEnum: {
        tourist: '旅游签证',
        business: '商务签证',
        work: '工作签证',
        study: '学习签证',
        family: '家庭团聚签证',
      },
    },
    {
      title: '签证名称',
      dataIndex: 'visaName',
      valueType: 'text',
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

  return (
    <PageContainer content="填写客户的护照信息，完成基本信息的建档。也可以快速添加多个签证信息与订单信息。">
      <Card bordered={false}>
        <StepsForm
          current={current}
          onCurrentChange={setCurrent}
          submitter={{
            render: (props, dom) => {
              if (props.step === 2) {
                return null;
              }
              return (
                <Space>
                  {dom}
                  <Button>保存返回</Button>
                </Space>
              );
            },
          }}
        >
          <StepsForm.StepForm<CustomerDataType>
            formRef={formRef}
            title="填写护照信息"
            initialValues={stepData}
            onFinish={async (values) => {
              setStepData(values);
              return true;
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <ProFormText
                label="客户姓名"
                width="sm"
                name="name"
                placeholder="请输入客户姓名"
              />
              <ProFormText
                label="护照号码"
                width="sm"
                name="passportNo"
                placeholder="请输入护照号码"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <ProFormSelect
                label="性别"
                width="xs"
                name="gender"
                valueEnum={{
                  male: '男',
                  female: '女',
                }}
                placeholder="请选择性别"
                style={{ width: 'calc(50% - 8px)' }}
              />
              <ProFormSelect
                label="国家"
                width="xs"
                name="country"
                valueEnum={{
                  china: '中国',
                  usa: '美国',
                  uk: '英国',
                  japan: '日本',
                  korea: '韩国',
                  france: '法国',
                  germany: '德国',
                  italy: '意大利',
                  russia: '俄罗斯',
                  canada: '加拿大',
                  australia: '澳大利亚',
                  newZealand: '新西兰',
                }}
                placeholder="请选择国家"
                style={{ width: 'calc(50% - 8px)' }}
              />
              <ProFormDatePicker
                label="出生日期"
                width="sm"
                name="birthDate"
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
                transform={(value: any) => {
                  return {
                    birthDate: value ? value.valueOf() : null,
                  };
                }}
              />
            </div>
            
            <ProFormDateRangePicker
              label="护照有效期"
              width="md"
              name="passportValidityPeriod"
              fieldProps={{
                format: 'YYYY-MM-DD',
              }}
              transform={(value: any) => {
                return {
                  issueDate: value?.[0] ? value[0].valueOf() : null,
                  expiryDate: value?.[1] ? value[1].valueOf() : null,
                };
              }}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm title="填写签证信息">
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
                  value={visaDataSource}
                  onChange={setVisaDataSource as any}
                  recordCreatorProps={{
                    newRecordType: 'dataSource',
                    record: () => ({
                      id: Date.now(),
                      country: '',
                      visaType: '',
                      visaName: '',
                      issueDate: null,
                      expiryDate: null,
                    }),
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
          
          <StepsForm.StepForm title="完成">
            <StepResult
              onFinish={async () => {
                setCurrent(0);
                formRef.current?.resetFields();
                const newDefaultRowKey = Date.now();
                setVisaDataSource([
                  {
                    id: newDefaultRowKey,
                    country: '',
                    visaType: '',
                    visaName: '',
                    issueDate: null,
                    expiryDate: null,
                  }
                ]);
                setEditableRowKeys([newDefaultRowKey]);
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ fontSize: 16 }}>客户基本信息</Text>
                <StepDescriptions stepData={stepData} bordered />
              </div>
              
              <div>
                <Text strong style={{ fontSize: 16 }}>签证信息</Text>
                {visaDataSource.length > 0 ? (
                  <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #f0f0f0', padding: 8 }}>国家</th>
                        <th style={{ border: '1px solid #f0f0f0', padding: 8 }}>签证类型</th>
                        <th style={{ border: '1px solid #f0f0f0', padding: 8 }}>签证名称</th>
                        <th style={{ border: '1px solid #f0f0f0', padding: 8 }}>签发日期</th>
                        <th style={{ border: '1px solid #f0f0f0', padding: 8 }}>到期日期</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visaDataSource.map((visa) => (
                        <tr key={visa.id}>
                          <td style={{ border: '1px solid #f0f0f0', padding: 8 }}>
                            {visa.country === 'china' && '中国'}
                            {visa.country === 'usa' && '美国'}
                            {visa.country === 'uk' && '英国'}
                            {visa.country === 'japan' && '日本'}
                            {visa.country === 'korea' && '韩国'}
                            {visa.country === 'france' && '法国'}
                            {visa.country === 'germany' && '德国'}
                            {visa.country === 'italy' && '意大利'}
                            {visa.country === 'russia' && '俄罗斯'}
                            {visa.country === 'canada' && '加拿大'}
                            {visa.country === 'australia' && '澳大利亚'}
                            {visa.country === 'newZealand' && '新西兰'}
                          </td>
                          <td style={{ border: '1px solid #f0f0f0', padding: 8 }}>
                            {visa.visaType === 'tourist' && '旅游签证'}
                            {visa.visaType === 'business' && '商务签证'}
                            {visa.visaType === 'work' && '工作签证'}
                            {visa.visaType === 'study' && '学习签证'}
                            {visa.visaType === 'family' && '家庭团聚签证'}
                          </td>
                          <td style={{ border: '1px solid #f0f0f0', padding: 8 }}>{visa.visaName}</td>
                          <td style={{ border: '1px solid #f0f0f0', padding: 8 }}>
                            {visa.issueDate ? moment(visa.issueDate).format('YYYY-MM-DD') : '-'}
                          </td>
                          <td style={{ border: '1px solid #f0f0f0', padding: 8 }}>
                            {visa.expiryDate ? moment(visa.expiryDate).format('YYYY-MM-DD') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">暂无签证信息</Text>
                  </div>
                )}
              </div>
            </StepResult>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button type="primary">保存返回</Button>
            </div>
          </StepsForm.StepForm>
        </StepsForm>
      </Card>
    </PageContainer>
  );
};

export default CreateCustomer;
