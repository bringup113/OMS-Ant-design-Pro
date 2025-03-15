import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
// @ts-ignore
import { addOrg, removeOrg, updateOrg, getOrgs } from './service';

/**
 * 添加机构
 * @param fields
 */
const handleAdd = async (fields: API.OrganizationListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addOrg({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败，请重试');
    return false;
  }
};

/**
 * 更新机构
 * @param fields
 */
const handleUpdate = async (fields: API.OrganizationListItem) => {
  const hide = message.loading('正在更新');
  try {
    await updateOrg(fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败，请重试');
    return false;
  }
};

/**
 * 删除机构
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.OrganizationListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeOrg({
      key: selectedRows.map((row) => row.key as string),
    });
    hide();
    message.success('删除成功');
    return true;
  } catch (error: any) {
    hide();
    // 显示后端返回的详细错误信息
    if (error.response && error.response.data && error.response.data.message) {
      message.error(error.response.data.message);
    } else {
      message.error('删除失败，请重试');
    }
    // 向上抛出一个已处理的错误对象，但不包含原始错误信息，避免重复显示错误
    throw new Error('ERROR_ALREADY_HANDLED');
  }
};

const OrganizationList: React.FC = () => {
  /**
   * 更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.OrganizationListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.OrganizationListItem[]>([]);

  /**
   * 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.OrganizationListItem>[] = [
    {
      title: '机构名称',
      dataIndex: 'name',
      valueType: 'text',
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
      title: '机构代码',
      dataIndex: 'code',
      valueType: 'text',
    },
    {
      title: '上级机构',
      dataIndex: 'parentName',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      valueType: 'digit',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        '0': {
          text: '禁用',
          status: 'error',
        },
        '1': {
          text: '启用',
          status: 'success',
        },
      },
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.searchTable.config" defaultMessage="编辑" />
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除此机构吗？"
          onConfirm={async () => {
            try {
              await handleRemove([record]);
              actionRef.current?.reload();
            } catch (error: any) {
              // 错误已在 handleRemove 中处理，这里不再显示错误信息
              if (error.message !== 'ERROR_ALREADY_HANDLED') {
                console.error('未处理的错误:', error);
              }
            }
          }}
          okText="确定"
          cancelText="取消"
        >
          <a key="delete" style={{ color: 'red' }}>
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.OrganizationListItem, API.PageParams>
        headerTitle="机构列表"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleUpdateModalVisible(true);
              setCurrentRow(undefined);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async (params) => {
          const result = await getOrgs(params);
          
          // 确保从API响应中正确提取数据
          const responseData = result.data || [];
          
          // 判断是否在进行搜索
          const isSearching = Object.keys(params).some(key => 
            ['name', 'code', 'status'].includes(key) && params[key as keyof typeof params]
          );
          
          if (isSearching) {
            // 搜索时不使用树形结构，直接返回扁平数据
            return {
              data: responseData,
              total: (result as any).total || responseData.length,
              success: (result as any).success !== false,
            };
          } else {
            // 非搜索状态下，构建树形结构
            const buildTree = (items: API.OrganizationListItem[], parentId: string = '0'): API.OrganizationListItem[] => {
              return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                  ...item,
                  children: buildTree(items, item.id),
                }));
            };
            
            const treeData = buildTree(responseData);
            return {
              data: treeData,
              total: (result as any).total || responseData.length,
              success: (result as any).success !== false,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="已选择" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          <Button
            onClick={async () => {
              try {
                await handleRemove(selectedRowsState);
                setSelectedRows([]);
                actionRef.current?.reload();
              } catch (error: any) {
                // 错误已在 handleRemove 中处理，这里不再显示错误信息
                if (error.message !== 'ERROR_ALREADY_HANDLED') {
                  console.error('未处理的错误:', error);
                }
              }
            }}
          >
            <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="批量删除" />
          </Button>
        </FooterToolbar>
      )}

      <UpdateForm
        onSubmit={async (value) => {
          let success;
          if (currentRow?.id) {
            success = await handleUpdate({ ...currentRow, ...value });
          } else {
            success = await handleAdd({ ...value } as API.OrganizationListItem);
          }

          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
          return success;
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
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
          <ProDescriptions<API.OrganizationListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.OrganizationListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default OrganizationList; 