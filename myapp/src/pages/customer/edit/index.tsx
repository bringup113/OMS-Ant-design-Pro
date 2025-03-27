import {
  PageContainer,
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Card, Spin, message } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { history, useParams, useRequest } from '@umijs/max';
import { getCustomerDetail, updateCustomer } from '@/services/system/customer';
import { getCountries } from '@/services/system/country';
import dayjs from 'dayjs';

const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<API.CustomerItem | null>(null);

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

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const handleSubmit = async (values: any) => {
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
    } catch (error) {
      message.error('更新失败');
    }
  };
  
  // 取消按钮处理函数
  const handleCancel = () => {
    history.push(`/customer/detail/${id}`);
  };

  if (loading) {
    return (
      <PageContainer title="编辑客户">
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
      <PageContainer title="编辑客户">
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            客户信息不存在
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`编辑客户: ${customer.name}`}>
      <Card>
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
          onFinish={handleSubmit}
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
            <ProFormText
              label="国家"
              width="xs"
              name="country"
              placeholder="请输入国家"
              rules={[{ required: true, message: '请输入国家' }]}
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
      </Card>
    </PageContainer>
  );
};

export default CustomerEdit; 