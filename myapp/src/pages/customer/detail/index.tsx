import { PageContainer, ProDescriptions, ProForm, ProFormDatePicker, ProFormDateRangePicker, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Card, Divider, Spin, Tabs, message } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { history, useParams, useLocation, useRequest } from '@umijs/max';
import moment from 'moment';
import dayjs from 'dayjs';
import { getCustomerDetail, getCustomerVisas, updateCustomer } from '@/services/system/customer';
import { getCountries } from '@/services/system/country';
import { VisaItem } from '../components/VisaModal';
import VisaTable from '../components/VisaTable';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<API.CustomerItem | null>(null);
  const [visas, setVisas] = useState<VisaItem[]>([]);
  const [visaLoading, setVisaLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(location.pathname.includes('/edit/'));
  
  // 获取国家列表
  const { data: countryData, loading: countryLoading } = useRequest(getCountries, {
    defaultParams: [{ pageSize: 1000, status: 'enabled' }],
  });
  
  // 转换国家数据为选项格式
  const countryOptions = useMemo(() => {
    if (!countryData?.data) return [];
    return countryData.data.map((item: any) => ({
      label: item.name,
      value: item.name,
    }));
  }, [countryData]);

  const fetchCustomerDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await getCustomerDetail(Number(id));
      if (response.success) {
        setCustomer(response.data);
      } else {
        message.error('获取客户信息失败');
      }
    } catch (error) {
      message.error('获取客户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisas = async () => {
    if (!id) return;
    
    setVisaLoading(true);
    try {
      const response = await getCustomerVisas(Number(id));
      if (response.success) {
        setVisas(response.data || []);
      }
    } catch (error) {
      message.error('获取签证信息失败');
    } finally {
      setVisaLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
    fetchVisas();
  }, [id]);

  useEffect(() => {
    setIsEditMode(location.pathname.includes('/edit/'));
  }, [location.pathname]);

  const handleEdit = () => {
    history.push(`/customer/edit/${id}`);
  };

  const handleBack = () => {
    history.push('/customer');
  };

  const handleSave = async (values: any) => {
    if (!id) return;
    
    try {
      // 处理日期字段
      const data = {
        ...values,
        birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
        issueDate: values.passportValidityPeriod?.[0] ? dayjs(values.passportValidityPeriod[0]).format('YYYY-MM-DD') : null,
        expiryDate: values.passportValidityPeriod?.[1] ? dayjs(values.passportValidityPeriod[1]).format('YYYY-MM-DD') : null,
      };
      
      // 移除不需要的字段
      delete data.passportValidityPeriod;
      
      await updateCustomer(Number(id), data);
      message.success('更新成功');
      history.push(`/customer/detail/${id}`);
      fetchCustomerDetail(); // 刷新数据
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleCancel = () => {
    history.push(`/customer/detail/${id}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (!customer) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            客户信息不存在
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={isEditMode ? `编辑客户: ${customer.name}` : `客户详情: ${customer.name}`}
      extra={
        isEditMode 
          ? [] 
          : [
              <Button key="edit" type="primary" onClick={handleEdit}>
                编辑
              </Button>,
              <Button key="back" onClick={handleBack}>
                返回
              </Button>,
            ]
      }
    >
      <Card title="基本信息" style={{ marginBottom: 24 }}>
        {isEditMode ? (
          <ProForm
            initialValues={{
              name: customer.name,
              passportNo: customer.passportNo,
              gender: customer.gender,
              country: customer.country,
              birthDate: customer.birthDate ? dayjs(customer.birthDate) : undefined,
              passportValidityPeriod: customer.issueDate && customer.expiryDate
                ? [dayjs(customer.issueDate), dayjs(customer.expiryDate)]
                : undefined,
            }}
            onFinish={handleSave}
            submitter={{
              searchConfig: {
                submitText: '保存',
                resetText: '取消',
              },
              render: (_, dom) => dom,
              onReset: handleCancel,
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <ProFormText
                label="客户姓名"
                width="sm"
                name="name"
                placeholder="请输入客户姓名"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              />
              <ProFormText
                label="护照号码"
                width="sm"
                name="passportNo"
                placeholder="请输入护照号码"
                rules={[{ required: true, message: '请输入护照号码' }]}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <ProFormRadio.Group
                label="性别"
                name="gender"
                options={[
                  {
                    label: '男',
                    value: 'male',
                  },
                  {
                    label: '女',
                    value: 'female',
                  },
                ]}
                placeholder="请选择性别"
                rules={[{ required: true, message: '请选择性别' }]}
                style={{ width: 'calc(50% - 8px)' }}
              />
              <ProFormSelect
                label="国家"
                width="xs"
                name="country"
                options={countryOptions}
                placeholder="请选择国家"
                fieldProps={{
                  loading: countryLoading,
                }}
                rules={[{ required: true, message: '请选择国家' }]}
                style={{ width: 'calc(50% - 8px)' }}
              />
              <ProFormDatePicker
                label="出生日期"
                width="sm"
                name="birthDate"
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
                rules={[{ required: true, message: '请选择出生日期' }]}
              />
            </div>
            
            <ProFormDateRangePicker
              label="护照有效期"
              width="md"
              name="passportValidityPeriod"
              fieldProps={{
                format: 'YYYY-MM-DD',
              }}
              rules={[{ required: true, message: '请选择护照有效期' }]}
            />
          </ProForm>
        ) : (
          <ProDescriptions
            column={2}
            bordered
            dataSource={customer}
            styles={{
              content: {}
            }}
            columns={[
              {
                title: '客户姓名',
                dataIndex: 'name',
              },
              {
                title: '护照号码',
                dataIndex: 'passportNo',
                copyable: true,
              },
              {
                title: '性别',
                dataIndex: 'gender',
                valueEnum: {
                  male: { text: '男' },
                  female: { text: '女' },
                },
              },
              {
                title: '国家',
                dataIndex: 'country',
              },
              {
                title: '出生日期',
                dataIndex: 'birthDate',
                render: (_, record) => record.birthDate ? moment(record.birthDate).format('YYYY-MM-DD') : '-',
              },
              {
                title: '护照签发日期',
                dataIndex: 'issueDate',
                render: (_, record) => record.issueDate ? moment(record.issueDate).format('YYYY-MM-DD') : '-',
              },
              {
                title: '护照到期日期',
                dataIndex: 'expiryDate',
                render: (_, record) => record.expiryDate ? moment(record.expiryDate).format('YYYY-MM-DD') : '-',
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                render: (_, record) => record.createdAt ? moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-',
              },
            ]}
          />
        )}
      </Card>

      <Card title="签证信息">
        <VisaTable
          customerId={Number(id)}
          dataSource={visas}
          loading={visaLoading}
          onRefresh={fetchVisas}
        />
      </Card>
    </PageContainer>
  );
};

export default CustomerDetail; 