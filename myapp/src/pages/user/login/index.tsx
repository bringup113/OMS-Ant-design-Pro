import { Footer } from '@/components';
import { login } from '@/services/ant-design-pro/api';
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Helmet, SelectLang, useIntl, useModel, history } from '@umijs/max';
import { Alert, App, Typography, Button, Form, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const { Title, Paragraph } = Typography;

const useStyles = createStyles(({ token }) => {
  return {
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      top: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
      zIndex: 999,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundColor: token.colorBgContainer,
    },
    content: {
      flex: '1',
      display: 'flex',
      width: '100%',
      height: '100%',
    },
    left: {
      position: 'relative',
      width: '50%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#f3f4fb',
    },
    leftBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    leftLogo: {
      position: 'relative',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      padding: '20px',
    },
    leftLogoImg: {
      width: '32px',
      height: '32px',
    },
    leftLogoTitle: {
      margin: '3px 0 0 10px',
      fontSize: '20px',
      fontWeight: 400,
      color: '#fff',
    },
    leftImg: {
      position: 'relative',
      zIndex: 10,
      display: 'block',
      width: '560px',
      margin: 'auto',
      marginTop: '15vh',
      '@media (max-width: 1366px)': {
        width: '480px',
        marginTop: '10vh',
      },
    },
    leftTextWrap: {
      position: 'absolute',
      bottom: '80px',
      width: '100%',
      textAlign: 'center',
      zIndex: 10,
      '@media (max-width: 1366px)': {
        bottom: '40px',
      },
    },
    leftTextTitle: {
      fontSize: '26px',
      fontWeight: 400,
      color: '#f9f9f9',
    },
    leftTextDesc: {
      marginTop: '10px',
      fontSize: '14px',
      color: '#c4cada',
    },
    right: {
      position: 'relative',
      flex: 1,
      height: '100%',
    },
    loginWrap: {
      position: 'absolute',
      inset: 0,
      width: '440px',
      height: '610px',
      padding: '0 5px',
      margin: 'auto',
      overflow: 'hidden',
      '@media (max-width: 768px)': {
        width: '90%',
      },
    },
    form: {
      boxSizing: 'border-box',
      height: '100%',
      padding: '40px 0',
      width: '100%',
    },
    formTitle: {
      marginLeft: '-2px',
      fontSize: '34px',
      fontWeight: 600,
      color: 'var(--art-text-gray-900)',
    },
    formSubTitle: {
      marginTop: '10px',
      fontSize: '14px',
      color: 'var(--art-text-gray-500)',
    },
    loginBtn: {
      width: '100%',
      height: '46px',
      marginTop: '30px',
    },
    footer: {
      marginTop: '20px',
      fontSize: '14px',
      color: 'var(--art-text-gray-800)',
      textAlign: 'center',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchUserInfo = async () => {
    try {
      const userInfo = await initialState?.fetchUserInfo?.();
      if (userInfo) {
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: userInfo,
          }));
        });
        return userInfo;
      }
      throw new Error('Failed to get user info');
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    setLoginLoading(true);
    try {
      // 登录
      const msg = await login({ ...values });
      console.log('登录响应:', msg);
      
      if (msg.status === 'ok' && (msg.access_token || msg.token)) {
        // 保存token到localStorage
        localStorage.setItem('token', msg.access_token || msg.token);
        
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        messageApi.success(defaultLoginSuccessMessage);
        
        try {
          // 获取用户信息并更新全局状态
          const userInfo = await fetchUserInfo();
          console.log('获取到的用户信息:', userInfo);
          
          if (userInfo) {
            flushSync(() => {
              setInitialState((s) => {
                const newState = {
                  ...s,
                  currentUser: userInfo,
                };
                console.log('更新后的全局状态:', newState);
                return newState;
              });
            });
          }
          
          // 登录成功后也重置 loading 状态，虽然会跳转页面，但为了代码完整性
          setLoginLoading(false);
          
          // 使用 history.push 替代 window.location.href
          const urlParams = new URL(window.location.href).searchParams;
          const redirect = urlParams.get('redirect');
          history.push(redirect || '/customer');
          return;
        } catch (error) {
          // 如果获取用户信息失败，清除token
          console.error('获取用户信息失败:', error);
          localStorage.removeItem('token');
          throw error;
        }
      } else {
        // 如果失败去设置用户错误信息
        setUserLoginState(msg);
        
        // 添加错误提示弹窗
        const errorMessage = intl.formatMessage({
          id: 'pages.login.accountLogin.errorMessage',
          defaultMessage: '账户或密码错误',
        });
        messageApi.error(errorMessage);
        setLoginLoading(false);
      }
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.error('登录失败:', error);
      messageApi.error(defaultLoginFailureMessage);
      setLoginLoading(false);
    }
  };
  const { status } = userLoginState;

  return (
    <div className={styles.container}>
      {contextHolder}
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div className={styles.content}>
        <div className={styles.left}>
          <img 
            className={styles.leftBg} 
            src="/images/login-bg.png" 
            alt={intl.formatMessage({
              id: 'pages.login.background.alt',
              defaultMessage: '背景',
            })} 
          />
          <div className={styles.leftLogo}>
            <img 
              src="/logo - White.png" 
              alt={intl.formatMessage({
                id: 'pages.login.logo.alt',
                defaultMessage: '标志',
              })} 
              className={styles.leftLogoImg} 
            />
            <h1 className={styles.leftLogoTitle}>
              <FormattedMessage id="pages.login.systemName" defaultMessage="天成订单管理系统" />
            </h1>
          </div>
          <img 
            className={styles.leftImg} 
            src="/images/login-illustration.png" 
            alt={intl.formatMessage({
              id: 'pages.login.illustration.alt',
              defaultMessage: '插图',
            })} 
          />
          <div className={styles.leftTextWrap}>
            <h1 className={styles.leftTextTitle}>
              <FormattedMessage id="pages.login.systemTitle" defaultMessage="专业的企业级订单管理系统" />
            </h1>
            <p className={styles.leftTextDesc}>
              <FormattedMessage id="pages.login.systemDesc" defaultMessage="高效、安全、易用的一站式解决方案" />
            </p>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.loginWrap}>
            <div className={styles.form}>
              <h1 className={styles.formTitle}>
                <FormattedMessage id="pages.login.welcomeTitle" defaultMessage="欢迎登录" />
              </h1>
              <p className={styles.formSubTitle}>
                <FormattedMessage id="pages.login.welcomeDesc" defaultMessage="请输入您的账号和密码" />
              </p>
              <LoginForm
                form={form}
                style={{
                  width: '100%',
                  marginTop: '25px',
                }}
                initialValues={{
                  autoLogin: true,
                }}
                onFinish={async (values) => {
                  await handleSubmit(values as API.LoginParams);
                }}
                submitter={{
                  render: () => null,
                }}
              >
                {status === 'error' && (
                  <LoginMessage
                    content={intl.formatMessage({
                      id: 'pages.login.accountLogin.errorMessage',
                      defaultMessage: '账户或密码错误',
                    })}
                  />
                )}
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
                    disabled: loginLoading,
                  }}
                  placeholder={intl.formatMessage({
                    id: 'pages.login.username.placeholder',
                    defaultMessage: '请输入用户名',
                  })}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.login.username.required"
                          defaultMessage="请输入用户名!"
                        />
                      ),
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                    disabled: loginLoading,
                  }}
                  placeholder={intl.formatMessage({
                    id: 'pages.login.password.placeholder',
                    defaultMessage: '请输入密码',
                  })}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.login.password.required"
                          defaultMessage="请输入密码！"
                        />
                      ),
                    },
                  ]}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                  }}
                >
                  <ProFormCheckbox noStyle name="autoLogin" disabled={loginLoading}>
                    <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
                  </ProFormCheckbox>
                </div>
                <Button
                  type="primary"
                  size="large"
                  className={styles.loginBtn}
                  loading={loginLoading}
                  disabled={loginLoading}
                  onClick={() => {
                    form.submit();
                  }}
                >
                  {loginLoading ? (
                    <FormattedMessage id="pages.login.loading" defaultMessage="登录中..." />
                  ) : (
                    <FormattedMessage id="pages.login.submit" defaultMessage="登录" />
                  )}
                </Button>
              </LoginForm>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
