import { addRule } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, message } from 'antd';
import { FC } from 'react';

interface CreateFormProps {
  reload?: ActionType['reload'];
}

const CreateForm: FC<CreateFormProps> = (props) => {
  const { reload } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const { run, loading } = useRequest(addRule, {
    manual: true,
    onSuccess: () => {
      messageApi.success('添加成功');
      reload?.();
    },
    onError: () => {
      messageApi.error('添加失败，请重试！');
    },
  });

  return (
    <>
      {contextHolder}
      <ModalForm
        title="新建产品"
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            新建
          </Button>
        }
        width="400px"
        modalProps={{ okButtonProps: { loading } }}
        onFinish={async (value) => {
          await run({ data: value as API.RuleListItem });

          return true;
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '请输入产品名称',
            },
          ]}
          width="md"
          name="name"
          label="产品名称"
        />
        <ProFormTextArea width="md" name="desc" label="产品描述" />
      </ModalForm>
    </>
  );
};

export default CreateForm;
