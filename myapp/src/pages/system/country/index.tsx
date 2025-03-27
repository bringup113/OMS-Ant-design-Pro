import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Drawer } from 'antd';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl, useAccess } from '@umijs/max';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProTable, ProDescriptions } from '@ant-design/pro-components';
import FormModal from './components/FormModal';
import { getCountries, addCountry, updateCountry, removeCountry } from './service';
import { API } from './typing';
import { useModel } from '@umijs/max';

/**
 * 添加国家
 */
const handleAdd = async (fields: API.CountryListItem) => {
  const hide = message.loading('正在添加');
  try {
    console.log('添加国家数据:', fields);
    
    await addCountry(fields);
    hide();
    message.success('添加成功');
    return true;
  } catch (error: any) {
    hide();
    console.error('添加国家失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      message.error(`添加失败: ${error.response.data.message}`);
    } else {
      message.error('添加失败，请重试');
    }
    return false;
  }
};

/**
 * 更新国家
 */
const handleUpdate = async (id: number, fields: API.CountryListItem) => {
  const hide = message.loading('正在更新');
  try {
    console.log('更新国家数据:', fields);
    
    // 确保不发送sort字段，只发送需要更新的字段
    const { sort, id: fieldId, createdAt, updatedAt, ...updateData } = fields;
    
    await updateCountry({...updateData, id});
    hide();
    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    console.error('更新国家失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      message.error(`更新失败: ${error.response.data.message}`);
    } else {
      message.error('更新失败，请重试');
    }
    return false;
  }
};

/**
 * 删除国家
 */
const handleRemove = async (id: number) => {
  const hide = message.loading('正在删除');
  try {
    await removeCountry({ key: [id.toString()] });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const CountryList: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.CountryListItem>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const access = useAccess();

  // 删除国家
  const handleDelete = async (id: number) => {
    try {
      const hide = message.loading('正在删除');
      await removeCountry({ key: [id.toString()] });
      hide();
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请重试');
    }
  };

  const columns: ProColumns<API.CountryListItem>[] = [
    {
      title: <FormattedMessage id="pages.country.name" defaultMessage="国家名称" />,
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.country.englishName" defaultMessage="英文名称" />,
      dataIndex: 'englishName',
    },
    {
      title: <FormattedMessage id="pages.country.status" defaultMessage="状态" />,
      dataIndex: 'status',
      valueEnum: {
        enabled: {
          text: <FormattedMessage id="pages.common.status.enabled" defaultMessage="启用" />,
          status: 'Success',
        },
        disabled: {
          text: <FormattedMessage id="pages.common.status.disabled" defaultMessage="禁用" />,
          status: 'Error',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.common.option" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        const actions = [];

        actions.push(
          <a
            key="edit"
            onClick={() => {
              console.log('编辑国家数据:', record);
              setCurrentRow(record);
              setCreateModalVisible(true);
            }}
          >
            <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
          </a>
        );

        actions.push(
          <a
            key="delete"
            onClick={() => handleDelete(record.id)}
            style={{ color: '#ff4d4f', marginLeft: 8 }}
          >
            <FormattedMessage id="pages.common.delete" defaultMessage="删除" />
          </a>
        );

        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.CountryListItem>
        headerTitle={intl.formatMessage({
          id: 'pages.country.title',
          defaultMessage: '国家管理',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.common.add" defaultMessage="新建" />
          </Button>,
        ]}
        request={getCountries}
        columns={columns}
      />

      <FormModal
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setCurrentRow(undefined);
        }}
        onSubmit={async (value) => {
          const success = currentRow?.id
            ? await handleUpdate(currentRow.id, value as API.CountryListItem)
            : await handleAdd(value as API.CountryListItem);
          if (success) {
            setCreateModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        values={currentRow}
        title={
          currentRow?.id
            ? intl.formatMessage({
                id: 'pages.country.edit',
                defaultMessage: '编辑国家',
              })
            : intl.formatMessage({
                id: 'pages.country.add',
                defaultMessage: '新建国家',
              })
        }
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.CountryListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            styles={{
              content: {}
            }}
            columns={columns as ProDescriptionsItemProps<API.CountryListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default CountryList;
