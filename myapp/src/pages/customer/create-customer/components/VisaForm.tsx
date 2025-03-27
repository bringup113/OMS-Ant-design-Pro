import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Space, Typography, Form, message, Input, DatePicker } from 'antd';
import { EditableProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import type { VisaDataType, VisaFormProps } from '../data.d';

const { Text } = Typography;

const VisaForm: React.FC<VisaFormProps> = ({ 
  customerName, 
  passportNo, 
  onSave, 
  loading 
}) => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  
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
  
  // 使用普通表单记录数据，绕过EditableProTable的问题
  const [manualFormData, setManualFormData] = useState<{
    country: string;
    visaName: string;
    issueDate: any;
    expiryDate: any;
  }>({
    country: '',
    visaName: '',
    issueDate: null,
    expiryDate: null,
  });

  // 初始化时将默认行设为编辑状态
  useEffect(() => {
    setEditableRowKeys(visaDataSource.map(item => item.id));
  }, []);

  // 签证信息表格列定义
  const visaColumns: ProColumns<VisaDataType>[] = [
    {
      title: '国家',
      dataIndex: 'country',
      valueType: 'text',
      formItemProps: {
        rules: [{ required: true, message: '请输入国家' }],
      },
    },
    {
      title: '签证名称',
      dataIndex: 'visaName',
      valueType: 'text',
      formItemProps: {
        rules: [{ required: true, message: '请输入签证名称' }],
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
            const newDataSource = visaDataSource.filter((item) => item.id !== record.id);
            setVisaDataSource(newDataSource);
            console.log('删除后的数据源:', newDataSource);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  // 使用直接表单提交
  const handleDirectSubmit = async () => {
    try {
      // 检查必填项
      if (!manualFormData.country || !manualFormData.visaName) {
        message.warning('请填写国家和签证名称');
        return false;
      }
      
      console.log('手动表单数据:', manualFormData);
      
      // 创建一个有效的签证数据
      const validVisa: VisaDataType = {
        id: Date.now(),
        country: manualFormData.country,
        visaName: manualFormData.visaName,
        issueDate: manualFormData.issueDate,
        expiryDate: manualFormData.expiryDate,
      };
      
      // 保存到数据源中
      setVisaDataSource([...visaDataSource, validVisa]);
      
      // 调用保存回调，直接使用手动表单的数据
      return onSave([validVisa]);
    } catch (error) {
      console.error('直接提交失败:', error);
      message.error('提交失败，请重试');
      return false;
    }
  };
  
  // 处理手动表单数据变更
  const handleManualInputChange = (field: string, value: any) => {
    setManualFormData({
      ...manualFormData,
      [field]: value,
    });
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <div>
          <Text strong style={{ fontSize: 30 }}>{customerName}</Text>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>{passportNo}</Text>
        </div>
        <Alert
          message="请填写客户的签证信息。必须填写国家和签证名称。"
          type="info"
          showIcon
        />
        
        {/* 使用直接的表单输入，绕过EditableProTable的问题 */}
        <Form layout="vertical">
          <Form.Item 
            label="国家" 
            required
            style={{ marginBottom: 16 }}
          >
            <Input 
              placeholder="请输入国家" 
              value={manualFormData.country}
              onChange={(e) => handleManualInputChange('country', e.target.value)}
            />
          </Form.Item>
          
          <Form.Item 
            label="签证名称" 
            required
            style={{ marginBottom: 16 }}
          >
            <Input 
              placeholder="请输入签证名称" 
              value={manualFormData.visaName}
              onChange={(e) => handleManualInputChange('visaName', e.target.value)}
            />
          </Form.Item>
          
          <Form.Item 
            label="签发日期"
            style={{ marginBottom: 16 }}
          >
            <DatePicker 
              style={{ width: '100%' }}
              onChange={(date) => handleManualInputChange('issueDate', date)}
            />
          </Form.Item>
          
          <Form.Item 
            label="到期日期"
            style={{ marginBottom: 16 }}
          >
            <DatePicker 
              style={{ width: '100%' }}
              onChange={(date) => handleManualInputChange('expiryDate', date)}
            />
          </Form.Item>
        </Form>
        
        <Button 
          type="primary" 
          loading={loading}
          onClick={handleDirectSubmit}
        >
          保存客户和签证信息
        </Button>
      </Space>
    </div>
  );
};

export default VisaForm; 