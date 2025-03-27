import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import type { Bill } from '../data.d';
import useStyles from '../style.style';

// 用于显示账单列表项的内容组件
const BillListContent: FC<{
  data: Bill;
}> = ({ data }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.listContent}>
      <div className={styles.listContentItem}>
        <span>账单金额</span>
        <p>${data.totalAmount}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>创建时间</span>
        <p>{dayjs(data.createdAt).format('YYYY-MM-DD HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>状态</span>
        <p>
          <Tag color={data.status === 'paid' ? 'success' : 'warning'}>
            {data.status === 'paid' ? '已结算' : '未结算'}
          </Tag>
        </p>
      </div>
    </div>
  );
};

export default BillListContent; 