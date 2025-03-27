import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormRadio,
  ProFormDigit,
  ProFormDependency,
} from '@ant-design/pro-components';
import { message, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { updateAgent } from '@/services/agent';

export type UpdateFormProps = {
  visible: boolean;
  current?: API.Agent;
  onVisibleChange: (visible: boolean) => void;
  onSuccess: () => void;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { visible, current, onVisibleChange, onSuccess } = props;

  return (
    <ModalForm
      title="编辑代理"
      width={500}
      visible={visible}
      onVisibleChange={onVisibleChange}
      initialValues={current}
      onFinish={async (values) => {
        if (!current?.id) {
          return false;
        }
        const response = await updateAgent(current.id, values as API.UpdateAgentParams);
        if (response) {
          message.success('更新成功');
          onSuccess();
          return true;
        }
        return false;
      }}
    >
      <ProFormText
        name="name"
        label="代理名称"
        rules={[
          {
            required: true,
            message: '请输入代理名称',
          },
        ]}
      />
      <ProFormText
        name="contact"
        label="联系方式"
        rules={[
          {
            required: true,
            message: '请输入联系方式',
          },
        ]}
      />
      <ProFormRadio.Group
        name="cooperationType"
        label={
          <Space>
            合作方式
            <Tooltip title="不分佣：按照标准价格交易；普通贸易：我们给代理固定的代理价格；利润分佣：我们给代理返现利润的百分比">
              <QuestionCircleOutlined />
            </Tooltip>
          </Space>
        }
        options={[
          {
            label: '不分佣',
            value: 'none',
          },
          {
            label: '普通贸易',
            value: 'regular',
          },
          {
            label: '利润分佣',
            value: 'commission',
          },
        ]}
        rules={[
          {
            required: true,
            message: '请选择合作方式',
          },
        ]}
      />
      <ProFormDependency name={['cooperationType']}>
        {({ cooperationType }) => {
          if (cooperationType === 'commission') {
            return (
              <ProFormDigit
                name="commissionRate"
                label="分佣比例(%)"
                min={0}
                max={100}
                fieldProps={{
                  precision: 2,
                  step: 1,
                  formatter: (value) => (value ? `${value}%` : ''),
                  parser: (value) => (value ? parseFloat(value.replace('%', '')) : 0),
                }}
                rules={[
                  {
                    required: true,
                    message: '请输入分佣比例',
                  },
                ]}
              />
            );
          }
          return null;
        }}
      </ProFormDependency>
      <ProFormSelect
        name="status"
        label="状态"
        options={[
          {
            label: '启用',
            value: 'active',
          },
          {
            label: '禁用',
            value: 'inactive',
          },
        ]}
      />
    </ModalForm>
  );
};

export default UpdateForm; 