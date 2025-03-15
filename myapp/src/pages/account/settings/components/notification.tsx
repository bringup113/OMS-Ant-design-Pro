import { List, Switch } from 'antd';
import React from 'react';
import { useIntl, FormattedMessage } from '@umijs/max';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const NotificationView: React.FC = () => {
  const intl = useIntl();
  
  const getData = () => {
    const Action = <Switch checkedChildren={intl.formatMessage({ id: 'pages.account.settings.notification.on' })} unCheckedChildren={intl.formatMessage({ id: 'pages.account.settings.notification.off' })} defaultChecked />;
    return [
      {
        title: intl.formatMessage({ id: 'pages.account.settings.notification.password' }),
        description: intl.formatMessage({ id: 'pages.account.settings.notification.password.description' }),
        actions: [Action],
      },
      {
        title: intl.formatMessage({ id: 'pages.account.settings.notification.system' }),
        description: intl.formatMessage({ id: 'pages.account.settings.notification.system.description' }),
        actions: [Action],
      },
      {
        title: intl.formatMessage({ id: 'pages.account.settings.notification.todo' }),
        description: intl.formatMessage({ id: 'pages.account.settings.notification.todo.description' }),
        actions: [Action],
      },
    ];
  };

  const data = getData();
  return (
    <>
      <List<Unpacked<typeof data>>
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </>
  );
};

export default NotificationView;
