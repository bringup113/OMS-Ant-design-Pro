import {
  ModalForm,
  ProFormDatePicker,
  ProFormText,
} from '@ant-design/pro-components';
import { message } from 'antd';
import dayjs from 'dayjs';
import { createVisa, updateVisa } from '@/services/system/customer';
import { VisaItem } from './VisaModal';

export interface VisaFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  customerId: number;
  initialValues?: VisaItem;
}

const VisaFormModal: React.FC<VisaFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  customerId,
  initialValues,
}) => {
  const handleSubmit = async (values: any) => {
    try {
      if (initialValues?.id) {
        // 更新签证信息
        await updateVisa(initialValues.id, {
          ...values,
          issueDate: values.issueDate ? dayjs(values.issueDate).format('YYYY-MM-DD') : null,
          expiryDate: values.expiryDate ? dayjs(values.expiryDate).format('YYYY-MM-DD') : null,
        });
        message.success('更新成功');
      } else {
        // 创建新签证信息
        await createVisa({
          ...values,
          customerId,
          issueDate: values.issueDate ? dayjs(values.issueDate).format('YYYY-MM-DD') : null,
          expiryDate: values.expiryDate ? dayjs(values.expiryDate).format('YYYY-MM-DD') : null,
        });
        message.success('添加成功');
      }
      onSuccess();
      return true;
    } catch (error) {
      message.error('操作失败');
      return false;
    }
  };

  return (
    <ModalForm
      title={initialValues?.id ? '编辑签证信息' : '添加签证信息'}
      width={500}
      open={visible}
      onFinish={handleSubmit}
      initialValues={initialValues ? {
        ...initialValues,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      } : undefined}
      modalProps={{
        onCancel,
        destroyOnClose: true,
      }}
    >
      <ProFormText
        name="country"
        label="国家"
        placeholder="请输入国家"
        rules={[{ required: true, message: '请输入国家' }]}
      />
      <ProFormText
        name="visaName"
        label="签证名称"
        placeholder="请输入签证名称"
        rules={[{ required: true, message: '请输入签证名称' }]}
      />
      <ProFormDatePicker
        name="issueDate"
        label="签发日期"
        placeholder="请选择签发日期"
        fieldProps={{
          format: 'YYYY-MM-DD',
        }}
        rules={[{ required: true, message: '请选择签发日期' }]}
      />
      <ProFormDatePicker
        name="expiryDate"
        label="到期日期"
        placeholder="请选择到期日期"
        fieldProps={{
          format: 'YYYY-MM-DD',
        }}
        rules={[{ required: true, message: '请选择到期日期' }]}
      />
    </ModalForm>
  );
};

export default VisaFormModal; 