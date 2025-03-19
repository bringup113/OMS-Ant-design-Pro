import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest, history } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  List,
  Modal,
  Progress,
  Radio,
  Row,
} from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import React, { useState } from 'react';
import type { BasicListItemDataType } from './data.d';
import { addFakeList, queryFakeList, removeFakeList, updateFakeList } from './service';
import useStyles from './style.style';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;
const Info: FC<{
  title: React.ReactNode;
  value: React.ReactNode;
  bordered?: boolean;
}> = ({ title, value, bordered }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.headerInfo}>
      <span>{title}</span>
      <p>{value}</p>
      {bordered && <em />}
    </div>
  );
};
const ListContent = ({
  data: { owner, createdAt, percent, status },
}: {
  data: BasicListItemDataType;
}) => {
  const { styles } = useStyles();
  return (
    <div>
      <div className={styles.listContentItem}>
        <span>负责人</span>
        <p>{owner}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>下单时间</span>
        <p>{dayjs(createdAt).format('YYYY-MM-DD HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <Progress
          percent={percent}
          status={status}
          strokeWidth={6}
          style={{
            width: 180,
          }}
        />
      </div>
    </div>
  );
};
export const OrderList: FC = () => {
  const { styles } = useStyles();
  const [current, setCurrent] = useState<Partial<BasicListItemDataType> | undefined>(undefined);
  const {
    data: listData,
    loading,
    mutate,
  } = useRequest(() => {
    return queryFakeList({
      count: 50,
    });
  });
  const { run: postRun } = useRequest(
    (method, params) => {
      if (method === 'remove') {
        return removeFakeList(params);
      }
      if (method === 'update') {
        return updateFakeList(params);
      }
      return addFakeList(params);
    },
    {
      manual: true,
      onSuccess: (result) => {
        mutate(result);
      },
    },
  );
  const list = listData?.list || [];
  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 5,
    total: list.length,
  };
  const deleteItem = (id: string) => {
    postRun('remove', {
      id,
    });
  };
  const editAndDelete = (key: string | number, currentItem: BasicListItemDataType) => {
    if (key === 'edit') {
      history.push(`/order/order-list/edit/${currentItem.id}`);
    } else if (key === 'delete') {
      Modal.confirm({
        title: '删除订单',
        content: '确定删除该订单吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => deleteItem(currentItem.id),
      });
    }
  };
  const extraContent = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <RadioGroup defaultValue="all">
        <RadioButton value="all">全部</RadioButton>
        <RadioButton value="progress">处理中</RadioButton>
        <RadioButton value="waiting">待处理</RadioButton>
      </RadioGroup>
      
      <Button
        type="primary"
        onClick={() => history.push('/order/order-list/create')}
        style={{ margin: '0 16px' }}
      >
        <PlusOutlined />
        添加订单
      </Button>
      
      <Search className={styles.extraContentSearch} placeholder="请输入" onSearch={() => ({})} />
    </div>
  );
  const MoreBtn: React.FC<{
    item: BasicListItemDataType;
  }> = ({ item }) => (
    <Dropdown
      menu={{
        onClick: ({ key }) => editAndDelete(key, item),
        items: [
          {
            key: 'edit',
            label: '编辑',
          },
          {
            key: 'delete',
            label: '删除',
          },
        ],
      }}
    >
      <a>
        更多 <DownOutlined />
      </a>
    </Dropdown>
  );
  return (
    <div>
      <PageContainer>
        <div className={styles.standardList}>
          <Card variant="borderless">
            <Row>
              <Col sm={8} xs={24}>
                <Info title="待处理订单" value="8个订单" bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="本周订单平均处理时间" value="32分钟" bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="本周完成订单数" value="24个订单" />
              </Col>
            </Row>
          </Card>

          <Card
            className={styles.listCard}
            bordered={false}
            title="订单列表"
            style={{
              marginTop: 24,
            }}
            bodyStyle={{
              padding: '0 32px 40px 32px',
            }}
            extra={extraContent}
          >
            <List
              size="large"
              rowKey="id"
              loading={loading}
              pagination={paginationProps}
              dataSource={list}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a
                      key="edit"
                      onClick={(e) => {
                        e.preventDefault();
                        history.push(`/order/order-list/edit/${item.id}`);
                      }}
                    >
                      编辑
                    </a>,
                    <MoreBtn key="more" item={item} />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.logo} shape="square" size="large" />}
                    title={<a href={item.href}>{item.title}</a>}
                    description={item.subDescription}
                  />
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </PageContainer>
    </div>
  );
};
export default OrderList;
