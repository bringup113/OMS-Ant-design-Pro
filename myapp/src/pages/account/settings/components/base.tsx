import { UploadOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useRequest, useIntl, FormattedMessage } from '@umijs/max';
import { Button, message, Upload } from 'antd';
import React from 'react';
import { queryCurrent } from '../service';
import useStyles from './index.style';

const BaseView: React.FC = () => {
  const { styles } = useStyles();
  const intl = useIntl();
  
  // 头像组件 方便以后独立，增加裁剪之类的功能
  const AvatarView = ({ avatar }: { avatar: string }) => (
    <>
      <div className={styles.avatar_title}>
        <FormattedMessage id="pages.account.settings.avatar" defaultMessage="头像" />
      </div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar" />
      </div>
      <Upload showUploadList={false}>
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            <FormattedMessage id="pages.account.settings.changeAvatar" defaultMessage="更换头像" />
          </Button>
        </div>
      </Upload>
    </>
  );
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });
  const getAvatarURL = () => {
    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  };
  const handleFinish = async () => {
    message.success(intl.formatMessage({
      id: 'pages.account.settings.updateSuccess',
      defaultMessage: '更新基本信息成功',
    }));
  };
  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: intl.formatMessage({
                    id: 'pages.account.settings.update',
                    defaultMessage: '更新基本信息',
                  }),
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={{
                ...currentUser,
              }}
              hideRequiredMark
            >
              <ProFormText
                width="md"
                name="email"
                label={intl.formatMessage({
                  id: 'pages.account.settings.email',
                  defaultMessage: '邮箱',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.email.required',
                      defaultMessage: '请输入您的邮箱!',
                    }),
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="name"
                label={intl.formatMessage({
                  id: 'pages.account.settings.nickname',
                  defaultMessage: '昵称',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.account.settings.nickname.required',
                      defaultMessage: '请输入您的昵称!',
                    }),
                  },
                ]}
              />
              <ProFormTextArea
                name="profile"
                label={intl.formatMessage({
                  id: 'pages.account.settings.profile',
                  defaultMessage: '个人简介',
                })}
                placeholder={intl.formatMessage({
                  id: 'pages.account.settings.profile.placeholder',
                  defaultMessage: '个人简介',
                })}
              />
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={getAvatarURL()} />
          </div>
        </>
      )}
    </div>
  );
};
export default BaseView;
