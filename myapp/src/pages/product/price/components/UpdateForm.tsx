import { updateRule } from '@/services/ant-design-pro/api';
import {
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message, Modal } from 'antd';
import React, { cloneElement, useCallback, useState } from 'react';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.RuleListItem>;

export type UpdateFormProps = {
  trigger?: JSX.Element;
  onOk?: () => void;
  values: Partial<API.RuleListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { onOk, values, trigger } = props;

  const [open, setOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const { run } = useRequest(updateRule, {
    manual: true,
    onSuccess: () => {
      messageApi.success('配置成功');
      onOk?.();
    },
    onError: () => {
      messageApi.error('配置失败，请重试！');
    },
  });

  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onFinish = useCallback(
    async (values?: any) => {
      await run({ data: values });

      onCancel();
    },
    [onCancel, run],
  );

  return (
    <>
      {contextHolder}
      {trigger
        ? cloneElement(trigger, {
            onClick: onOpen,
          })
        : null}
      <StepsForm
        stepsProps={{
          size: 'small',
        }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              width={640}
              bodyStyle={{ padding: '32px 40px 48px' }}
              destroyOnClose
              title="报价配置"
              open={open}
              footer={submitter}
              onCancel={onCancel}
            >
              {dom}
            </Modal>
          );
        }}
        onFinish={onFinish}
      >
        <StepsForm.StepForm
          initialValues={values}
          title="基本信息"
        >
          <ProFormText
            name="name"
            label="产品名称"
            width="md"
            rules={[
              {
                required: true,
                message: '请输入产品名称！',
              },
            ]}
          />
          <ProFormDigit
            name="callNo"
            label="产品价格"
            width="md"
            min={0}
            rules={[
              {
                required: true,
                message: '请输入产品价格！',
              },
            ]}
          />
          <ProFormTextArea
            name="desc"
            width="md"
            label="报价说明"
            placeholder="请输入至少五个字符"
            rules={[
              {
                required: true,
                message: '请输入至少五个字符的报价说明！',
                min: 5,
              },
            ]}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          initialValues={{
            target: '0',
            template: '0',
          }}
          title="配置价格策略"
        >
          <ProFormSelect
            name="target"
            width="md"
            label="客户类型"
            valueEnum={{
              0: '零售客户',
              1: '批发客户',
            }}
          />
          <ProFormSelect
            name="template"
            width="md"
            label="价格模板"
            valueEnum={{
              0: '标准价格',
              1: '促销价格',
            }}
          />
          <ProFormRadio.Group
            name="type"
            label="价格类型"
            options={[
              {
                value: '0',
                label: '固定价格',
              },
              {
                value: '1',
                label: '浮动价格',
              },
            ]}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          initialValues={{
            type: '1',
            frequency: 'month',
          }}
          title="设置价格有效期"
        >
          <ProFormDateTimePicker
            name="time"
            width="md"
            label="生效时间"
            rules={[
              {
                required: true,
                message: '请选择生效时间！',
              },
            ]}
          />
          <ProFormSelect
            name="frequency"
            label="价格调整"
            width="md"
            valueEnum={{
              month: '每月',
              quarter: '每季度',
            }}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};

export default UpdateForm;
