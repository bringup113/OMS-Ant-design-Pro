import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Radio, InputNumber, message } from 'antd';
import { getOrganizations } from '@/services/system/organization';

interface UpdateFormProps {
  updateModalVisible: boolean;
  onCancel: () => void;
  onSubmit: (values: API.FormValueType) => Promise<boolean>;
  values: Partial<API.OrganizationListItem>;
}

interface OrganizationOption {
  label: string;
  value: number;
  type: 'supplier' | 'customer';
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { updateModalVisible, onCancel, onSubmit, values } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState<OrganizationOption[]>([]);
  const [selectedParentType, setSelectedParentType] = useState<'supplier' | 'customer' | null>(null);
  const [cooperationType, setCooperationType] = useState<string>('no_commission');

  useEffect(() => {
    if (updateModalVisible) {
      form.resetFields();
      if (values) {
        console.log('设置表单初始值:', values);
        // 确保commission_rate正确设置
        form.setFieldsValue({
          ...values,
          commission_rate: (values as any).commission_rate !== undefined ? (values as any).commission_rate : 0
        });
        // 如果是编辑模式，设置父级机构类型和合作方式
        if (values.parent?.type) {
          setSelectedParentType(values.parent.type as 'supplier' | 'customer');
        }
        if (values.cooperation_type) {
          setCooperationType(values.cooperation_type);
        }
      }
      void fetchParentOptions();
    }
  }, [updateModalVisible, values, form]);

  const fetchParentOptions = async () => {
    try {
      const response = await getOrganizations({});
      console.log('获取到的机构列表原始数据:', response);
      if (response.data) {
        const options = response.data.map((org: API.Organization) => ({
          label: org.name,
          value: org.id,
          type: org.type
        }));
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
      
      // 确保commission_rate是数字类型
      if (values.cooperation_type === 'profit_commission') {
        values.commission_rate = Number(values.commission_rate || 0);
      } else {
        // 如果不是利润分佣，确保移除commission_rate字段
        delete values.commission_rate;
      }
      
      // 移除多余字段，只保留API需要的字段
      const cleanedValues = {
        name: values.name,
        code: values.code,
        parentId: values.parentId,
        status: values.status,
        cooperation_type: values.cooperation_type,
        ...(values.commission_rate !== undefined ? { commission_rate: values.commission_rate } : {})
      };
      
      console.log('清理后的表单数据:', cleanedValues);
      
      setLoading(true);
      const success = await onSubmit(cleanedValues);
      setLoading(false);
      return success;
    } catch (error) {
      setLoading(false);
      console.error('表单验证失败:', error);
      return false;
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
      title={values.id ? '编辑机构' : '新建机构'}
      open={updateModalVisible}
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
                  onChange={(value) => {
                    // 确保值是数字类型
                    if (value !== null) {
                      form.setFieldValue('commission_rate', Number(value));
                    }
                  }}
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

export default UpdateForm; 