import { updateRule } from '@/services/ant-design-pro/api';
import {
  ProFormDateTimePicker,
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
              title="客户配置"
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
            label="客户名称"
            width="md"
            rules={[
              {
                required: true,
                message: '请输入客户名称！',
              },
            ]}
          />
          <ProFormTextArea
            name="desc"
            width="md"
            label="客户描述"
            placeholder="请输入至少五个字符"
            rules={[
              {
                required: true,
                message: '请输入至少五个字符的客户描述！',
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
          title="配置客户属性"
        >
          <ProFormSelect
            name="target"
            width="md"
            label="客户类型"
            valueEnum={{
              0: '个人客户',
              1: '企业客户',
            }}
          />
          <ProFormSelect
            name="template"
            width="md"
            label="客户模板"
            valueEnum={{
              0: '客户模板一',
              1: '客户模板二',
            }}
          />
          <ProFormRadio.Group
            name="type"
            label="客户级别"
            options={[
              {
                value: '0',
                label: '重要',
              },
              {
                value: '1',
                label: '普通',
              },
            ]}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          initialValues={{
            type: '1',
            frequency: 'month',
          }}
          title="设定联系周期"
        >
          <ProFormDateTimePicker
            name="time"
            width="md"
            label="下次联系时间"
            rules={[
              {
                required: true,
                message: '请选择下次联系时间！',
              },
            ]}
          />
          <ProFormSelect
            name="frequency"
            label="联系频率"
            width="md"
            valueEnum={{
              month: '每月',
              week: '每周',
            }}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};

export default UpdateForm;
