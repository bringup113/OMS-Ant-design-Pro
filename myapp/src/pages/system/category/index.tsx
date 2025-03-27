import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Drawer } from 'antd';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FormattedMessage, useIntl, useAccess } from '@umijs/max';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProTable, ProDescriptions } from '@ant-design/pro-components';
import FormModal from './components/FormModal';
import { getProductCategories, addProductCategory, updateProductCategory, removeProductCategory, getProductCategoryTree } from '@/services/system/product-category';
import { API } from './typing.d';
import { useModel } from '@umijs/max';

/**
 * 添加产品类别
 */
const handleAdd = async (fields: API.ProductCategoryListItem) => {
  const hide = message.loading('正在添加');
  try {
    // 确保数字类型字段正确
    const data = {
      ...fields,
      parentId: fields.parentId ? Number(fields.parentId) : undefined,
    };
    
    console.log('添加产品类别数据:', data);
    
    await addProductCategory(data);
    hide();
    message.success('添加成功');
    return true;
  } catch (error: any) {
    hide();
    console.error('添加产品类别失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      message.error(`添加失败: ${error.response.data.message}`);
    } else {
      message.error('添加失败，请重试');
    }
    return false;
  }
};

/**
 * 更新产品类别
 */
const handleUpdate = async (id: number, fields: API.ProductCategoryListItem) => {
  const hide = message.loading('正在更新');
  try {
    // 确保数字类型字段正确
    const data = {
      ...fields,
      parentId: fields.parentId ? Number(fields.parentId) : undefined,
    };
    
    console.log('更新产品类别数据:', data);
    
    await updateProductCategory(id, data);
    hide();
    message.success('更新成功');
    return true;
  } catch (error: any) {
    hide();
    console.error('更新产品类别失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      message.error(`更新失败: ${error.response.data.message}`);
    } else {
      message.error('更新失败，请重试');
    }
    return false;
  }
};

/**
 * 删除产品类别
 */
const handleRemove = async (id: number) => {
  const hide = message.loading('正在删除');
  try {
    await removeProductCategory(id);
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const ProductCategoryList: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.ProductCategoryListItem>();
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const isSupplier = access.isSupplier;

  // 获取产品类别树
  const fetchCategoryTree = useCallback(async () => {
    try {
      const response = await getProductCategoryTree();
      console.log('获取产品类别树:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        setCategoryOptions(response.data);
      }
    } catch (error) {
      console.error('获取产品类别树失败:', error);
      message.error('获取产品类别树失败');
    }
  }, []);

  // 初始化时获取产品类别树
  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  // 删除产品类别
  const handleDelete = async (id: number) => {
    try {
      const hide = message.loading('正在删除');
      await removeProductCategory(id);
      hide();
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请重试');
    }
  };

  const columns: ProColumns<API.ProductCategoryListItem>[] = [
    {
      title: <FormattedMessage id="pages.category.name" defaultMessage="类别名称" />,
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
      title: <FormattedMessage id="pages.category.code" defaultMessage="类别编码" />,
      dataIndex: 'code',
    },
    {
      title: <FormattedMessage id="pages.category.status" defaultMessage="状态" />,
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
              console.log('编辑产品类别数据:', record);
              setCurrentRow(record);
              setCreateModalVisible(true);
            }}
          >
            <FormattedMessage id="pages.common.edit" defaultMessage="编辑" />
          </a>
        );

        if (!access.isSupplier) {
          actions.push(
            <a
              key="delete"
              onClick={() => handleDelete(record.id)}
              style={{ color: '#ff4d4f', marginLeft: 8 }}
            >
              <FormattedMessage id="pages.common.delete" defaultMessage="删除" />
            </a>
          );
        }

        return actions;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ProductCategoryListItem>
        headerTitle={intl.formatMessage({
          id: 'pages.category.title',
          defaultMessage: '产品类别',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        pagination={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.category.add" defaultMessage="新建" />
          </Button>,
        ]}
        request={async (params) => {
          // 处理搜索参数
          const { current, pageSize, ...searchParams } = params;
          
          // 如果是供应商用户，自动添加供应商ID筛选
          const requestParams = { ...searchParams };
          
          // 确保供应商ID是数字类型
          if (requestParams.supplierId) {
            // 如果选择了供应商，确保是数字类型
            requestParams.supplierId = Number(requestParams.supplierId);
          } else if (isSupplier && currentUser?.organization_id) {
            // 如果是供应商用户，使用当前用户的组织ID
            requestParams.supplierId = Number(currentUser.organization_id);
          }
          
          console.log('请求参数:', requestParams);
          
          try {
            const response = await getProductCategories(requestParams);
            console.log('获取产品类别列表 - 原始响应:', JSON.stringify(response));
            
            if (response && response.data && Array.isArray(response.data)) {
              // 检查数据结构
              const hasChildren = response.data.some((item: API.ProductCategoryListItem) => item.children && item.children.length > 0);
              console.log('数据中是否包含children字段:', hasChildren);
              console.log('第一条数据:', JSON.stringify(response.data[0], null, 2));
              
              // 检查是否有parentId字段但没有children字段
              const hasParentId = response.data.some((item: API.ProductCategoryListItem) => item.parentId);
              console.log('数据中是否包含parentId字段:', hasParentId);
              
              // 如果有parentId但没有children，可能需要手动构建树形结构
              if (hasParentId && !hasChildren) {
                console.log('需要手动构建树形结构');
                // 手动构建树形结构
                const buildTree = (items: API.ProductCategoryListItem[], parentId: number | null = null): API.ProductCategoryListItem[] => {
                  return items
                    .filter(item => 
                      (parentId === null && !item.parentId) || 
                      (item.parentId === parentId)
                    )
                    .map(item => {
                      const children = buildTree(items, item.id);
                      return {
                        ...item,
                        children: children.length > 0 ? children : undefined
                      };
                    });
                };
                
                const treeData = buildTree(response.data);
                console.log('手动构建的树形结构:', JSON.stringify(treeData, null, 2));
                
                return {
                  data: treeData,
                  success: response.success,
                  total: response.total,
                };
              }
              
              return {
                data: response.data,
                success: response.success,
                total: response.total,
              };
            }
            return {
              data: [],
              success: true,
            };
          } catch (error) {
            console.error('获取产品类别列表失败:', error);
            message.error('获取产品类别列表失败');
            return {
              data: [],
              success: false,
            };
          }
        }}
        columns={columns}
        expandable={{
          defaultExpandAllRows: true,
          indentSize: 30,
        }}
        childrenColumnName="children"
      />

      <FormModal
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
        }}
        onSubmit={async (value) => {
          let success = false;
          
          try {
            // 确保数字类型字段正确
            const submitData = {
              ...value,
              parentId: value.parentId ? Number(value.parentId) : undefined,
            };
            
            if (currentRow?.id) {
              // 更新
              await updateProductCategory(currentRow.id, submitData);
              message.success('更新成功');
            } else {
              // 新增
              await addProductCategory(submitData);
              message.success('添加成功');
            }
            
            success = true;
          } catch (error: any) {
            console.error('操作失败:', error);
            if (error.response && error.response.data && error.response.data.message) {
              message.error(`操作失败: ${error.response.data.message}`);
            } else {
              message.error('操作失败，请重试');
            }
            success = false;
          }
          
          if (success) {
            setCreateModalVisible(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
            fetchCategoryTree();
          }
        }}
        values={currentRow}
        title={
          currentRow?.id
            ? intl.formatMessage({ id: 'pages.category.edit', defaultMessage: '编辑产品类别' })
            : intl.formatMessage({ id: 'pages.category.add', defaultMessage: '新建产品类别' })
        }
        categoryOptions={categoryOptions}
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
          <ProDescriptions<API.ProductCategoryListItem>
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
            columns={[
              {
                title: <FormattedMessage id="pages.category.name" defaultMessage="类别名称" />,
                dataIndex: 'name',
                valueType: 'text',
              },
              {
                title: <FormattedMessage id="pages.category.code" defaultMessage="类别编码" />,
                dataIndex: 'code',
                valueType: 'text',
              },
              {
                title: <FormattedMessage id="pages.category.status" defaultMessage="状态" />,
                dataIndex: 'status',
                valueEnum: {
                  disabled: {
                    text: <FormattedMessage id="pages.common.status.disabled" defaultMessage="禁用" />,
                    status: 'Error',
                  },
                  enabled: {
                    text: <FormattedMessage id="pages.common.status.enabled" defaultMessage="启用" />,
                    status: 'Success',
                  },
                },
              },
              {
                title: <FormattedMessage id="pages.category.description" defaultMessage="描述" />,
                dataIndex: 'description',
                valueType: 'text',
                span: 2,
              },
              {
                title: <FormattedMessage id="pages.common.createdAt" defaultMessage="创建时间" />,
                dataIndex: 'createdAt',
                valueType: 'dateTime',
              },
            ] as ProDescriptionsItemProps<API.ProductCategoryListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ProductCategoryList;
