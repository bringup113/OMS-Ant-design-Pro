import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Radio, InputNumber, Space, message } from 'antd';
import { useIntl } from '@umijs/max';
import { getOrganizations } from '@/services/system/organization';

interface OrganizationFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  values?: Record<string, any>;
  title: string;
}

interface OrganizationOption {
  label: string;
  value: number;
  type: string;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({ visible, onCancel, onSubmit, values, title }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState<OrganizationOption[]>([]);
  const [selectedParentType, setSelectedParentType] = useState<string | null>(null);
  const [cooperationType, setCooperationType] = useState<string>('no_commission');
  const intl = useIntl();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (values) {
        form.setFieldsValue(values);
        // 如果是编辑模式，设置父级机构类型和合作方式
        if (values.parent?.type) {
          setSelectedParentType(values.parent.type);
        }
        if (values.cooperation_type) {
          setCooperationType(values.cooperation_type);
        }
      }
      void fetchParentOptions();
    }
  }, [visible, values, form]);

  const fetchParentOptions = async () => {
    try {
      const response = await getOrganizations({});
      console.log('获取到的机构列表原始数据:', response);
      if (response.data) {
        const options = response.data.map((org: any) => {
          console.log('处理机构数据:', org);
          return {
            label: org.name,
            value: org.id,
            type: org.type
          };
        });
        console.log('处理后的选项:', options);
        setParentOptions(options);
      }
    } catch (error) {
      console.error('获取上级机构失败:', error);
      message.error('获取上级机构失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('提交的表单数据:', values);
      setLoading(true);
      await onSubmit(values);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('表单验证失败:', error);
    }
  };

  const handleParentChange = (value: number | null) => {
    console.log('选择的父级机构ID:', value);
    if (value === null) {
      console.log('清除了父级机构选择');
      setSelectedParentType(null);
      form.setFieldsValue({ cooperation_type: 'no_commission' });
      return;
    }

    const parent = parentOptions.find(opt => opt.value === value);
    console.log('找到的父级机构:', parent);
    if (parent) {
      console.log('父级机构类型:', parent.type);
      setSelectedParentType(parent.type);
      
      if (parent.type === 'supplier') {
        console.log('选择了供应商类型，设置默认合作方式');
        form.setFieldsValue({ cooperation_type: 'no_commission' });
      }
    }
  };

  const handleCooperationTypeChange = (e: any) => {
    setCooperationType(e.target.value);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: '1',
          cooperation_type: 'no_commission',
          commission_rate: 0
        }}
      >
        <Form.Item
          name="name"
          label="机构名称"
          rules={[{ required: true, message: '请输入机构名称' }]}
        >
          <Input placeholder="请输入机构名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="机构编码"
          rules={[
            { pattern: /^[a-zA-Z0-9]*$/, message: '机构编码只能包含英文字母和数字' }
          ]}
        >
          <Input placeholder="请输入机构编码（选填）" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="上级机构"
        >
          <Select
            placeholder="请选择上级机构（选填）"
            allowClear
            options={parentOptions}
            onChange={handleParentChange}
          />
        </Form.Item>

        {selectedParentType === 'supplier' && (
          <>
            <Form.Item
              name="cooperation_type"
              label="合作方式"
              rules={[{ required: true, message: '请选择合作方式' }]}
            >
              <Radio.Group onChange={handleCooperationTypeChange}>
                <Radio value="no_commission">不分佣</Radio>
                <Radio value="normal_trade">普通贸易</Radio>
                <Radio value="profit_commission">利润分佣</Radio>
              </Radio.Group>
            </Form.Item>

            {cooperationType === 'profit_commission' && (
              <Form.Item
                name="commission_rate"
                label="佣金比例(%)"
                rules={[
                  { required: true, message: '请输入佣金比例' },
                  { type: 'number', min: 0, max: 100, message: '佣金比例必须在0-100之间' }
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  precision={2}
                  step={1}
                  style={{ width: '100%' }}
                  addonAfter="%"
                />
              </Form.Item>
            )}
          </>
        )}

        <Form.Item
          name="status"
          label="状态"
          initialValue="1"
        >
          <Radio.Group>
            <Radio value="1">启用</Radio>
            <Radio value="0">禁用</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrganizationForm; 