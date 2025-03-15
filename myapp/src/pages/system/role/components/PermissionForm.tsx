import {
  ModalForm,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { Tabs, Tree, Checkbox, Space, Card, Row, Col } from 'antd';
import React, { useState, useEffect } from 'react';

const { TabPane } = Tabs;

export type FormValueType = {
  permissions?: string[];
};

export type PermissionFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  permissionModalVisible: boolean;
  values: Partial<API.RoleListItem>;
};

const PermissionForm: React.FC<PermissionFormProps> = (props) => {
  const [activeKey, setActiveKey] = useState('menuFunction');
  const [checkedPermissions, setCheckedPermissions] = useState<string[]>(props.values.permissions || []);

  // 菜单和功能权限结构
  const menuFunctionData = [
    {
      title: '系统管理',
      key: 'system',
      children: [
        {
          title: '用户管理',
          key: 'system.user-list',
          functions: [
            { label: '查询', value: 'user:query' },
            { label: '新增', value: 'user:add' },
            { label: '编辑', value: 'user:edit' },
            { label: '删除', value: 'user:delete' },
          ],
        },
        {
          title: '机构管理',
          key: 'system.organization',
          functions: [
            { label: '查询', value: 'org:query' },
            { label: '新增', value: 'org:add' },
            { label: '编辑', value: 'org:edit' },
            { label: '删除', value: 'org:delete' },
          ],
        },
        {
          title: '角色管理',
          key: 'system.role',
          functions: [
            { label: '查询', value: 'role:query' },
            { label: '新增', value: 'role:add' },
            { label: '编辑', value: 'role:edit' },
            { label: '删除', value: 'role:delete' },
          ],
        },
      ],
    },
    {
      title: '客户管理',
      key: 'customer',
      functions: [
        { label: '查询', value: 'customer:query' },
        { label: '新增', value: 'customer:add' },
        { label: '编辑', value: 'customer:edit' },
        { label: '删除', value: 'customer:delete' },
      ],
    },
    {
      title: '订单管理',
      key: 'order',
      children: [
        {
          title: '订单列表',
          key: 'order.order-list',
          functions: [
            { label: '查询', value: 'order:query' },
            { label: '新增', value: 'order:add' },
            { label: '编辑', value: 'order:edit' },
            { label: '删除', value: 'order:delete' },
          ],
        },
        {
          title: '账单管理',
          key: 'order.bill-management',
          functions: [
            { label: '查询', value: 'bill:query' },
            { label: '导出', value: 'bill:export' },
          ],
        },
      ],
    },
    {
      title: '产品管理',
      key: 'product',
      children: [
        {
          title: '产品类别',
          key: 'product.category',
          functions: [
            { label: '查询', value: 'product-category:query' },
            { label: '新增', value: 'product-category:add' },
            { label: '编辑', value: 'product-category:edit' },
            { label: '删除', value: 'product-category:delete' },
          ],
        },
        {
          title: '产品列表',
          key: 'product.list',
          functions: [
            { label: '查询', value: 'product:query' },
            { label: '新增', value: 'product:add' },
            { label: '编辑', value: 'product:edit' },
            { label: '删除', value: 'product:delete' },
          ],
        },
        {
          title: '产品报价',
          key: 'product.price',
          functions: [
            { label: '查询', value: 'product-price:query' },
            { label: '设置', value: 'product-price:set' },
          ],
        },
      ],
    },
    {
      title: '仪表盘',
      key: 'dashboard',
    },
  ];

  // 字段权限结构，按菜单分组
  const fieldPermissionData = [
    {
      title: '用户管理',
      key: 'system.user-list.fields',
      fields: [
        { label: '用户ID', value: 'user:id' },
        { label: '用户名', value: 'user:username' },
        { label: '姓名', value: 'user:name' },
        { label: '邮箱', value: 'user:email' },
        { label: '手机号', value: 'user:phone' },
        { label: '所属机构', value: 'user:organization' },
        { label: '角色', value: 'user:role' },
        { label: '状态', value: 'user:status' },
        { label: '创建时间', value: 'user:createdAt' },
      ],
    },
    {
      title: '客户管理',
      key: 'customer.fields',
      fields: [
        { label: '客户ID', value: 'customer:id' },
        { label: '客户名称', value: 'customer:name' },
        { label: '联系人', value: 'customer:contact' },
        { label: '联系电话', value: 'customer:phone' },
        { label: '地址', value: 'customer:address' },
      ],
    },
    {
      title: '订单管理',
      key: 'order.fields',
      fields: [
        { label: '订单ID', value: 'order:id' },
        { label: '订单编号', value: 'order:number' },
        { label: '客户名称', value: 'order:customerName' },
        { label: '订单金额', value: 'order:amount' },
        { label: '订单状态', value: 'order:status' },
        { label: '创建时间', value: 'order:createdAt' },
      ],
    },
    {
      title: '产品管理',
      key: 'product.fields',
      fields: [
        { label: '产品ID', value: 'product:id' },
        { label: '产品名称', value: 'product:name' },
        { label: '产品编码', value: 'product:code' },
        { label: '产品类别', value: 'product:category' },
        { label: '产品价格', value: 'product:price' },
        { label: '产品状态', value: 'product:status' },
      ],
    },
  ];

  // 获取菜单项的所有子权限（包括子菜单和功能）
  const getAllChildPermissions = (item: any): string[] => {
    const permissions: string[] = [];
    
    // 添加当前菜单的key
    if (item.key) {
      permissions.push(item.key);
    }
    
    // 添加功能权限
    if (item.functions) {
      item.functions.forEach((func: any) => {
        permissions.push(func.value);
      });
    }
    
    // 递归添加子菜单权限
    if (item.children) {
      item.children.forEach((child: any) => {
        permissions.push(...getAllChildPermissions(child));
      });
    }
    
    return permissions;
  };

  // 获取菜单项的直接子权限（不包括子菜单的子权限）
  const getDirectChildPermissions = (item: any): string[] => {
    const permissions: string[] = [];
    
    // 添加功能权限
    if (item.functions) {
      item.functions.forEach((func: any) => {
        permissions.push(func.value);
      });
    }
    
    // 添加子菜单的key
    if (item.children) {
      item.children.forEach((child: any) => {
        if (child.key) {
          permissions.push(child.key);
        }
      });
    }
    
    return permissions;
  };

  // 获取字段组的所有字段权限
  const getAllFieldPermissions = (item: any): string[] => {
    const permissions: string[] = [];
    
    if (item.fields) {
      item.fields.forEach((field: any) => {
        permissions.push(field.value);
      });
    }
    
    return permissions;
  };

  // 处理菜单和功能权限的选择
  const handlePermissionChange = (item: any, checked: boolean) => {
    let newPermissions = [...checkedPermissions];
    const itemKey = item.key || item.value;
    
    if (checked) {
      // 添加当前权限
      if (!newPermissions.includes(itemKey)) {
        newPermissions.push(itemKey);
      }
      
      // 如果是菜单项，添加所有子权限
      if (item.key && (item.children || item.functions)) {
        const childPermissions = getAllChildPermissions(item);
        childPermissions.forEach(permission => {
          if (!newPermissions.includes(permission)) {
            newPermissions.push(permission);
          }
        });
      }
    } else {
      // 移除当前权限
      newPermissions = newPermissions.filter(p => p !== itemKey);
      
      // 如果是菜单项，移除所有子权限
      if (item.key && (item.children || item.functions)) {
        const childPermissions = getAllChildPermissions(item);
        newPermissions = newPermissions.filter(p => !childPermissions.includes(p));
      }
    }
    
    setCheckedPermissions(newPermissions);
  };

  // 处理字段权限的选择
  const handleFieldPermissionChange = (item: any, checked: boolean) => {
    let newPermissions = [...checkedPermissions];
    const itemValue = item.value;
    
    if (checked) {
      // 添加当前字段权限
      if (!newPermissions.includes(itemValue)) {
        newPermissions.push(itemValue);
      }
    } else {
      // 移除当前字段权限
      newPermissions = newPermissions.filter(p => p !== itemValue);
    }
    
    setCheckedPermissions(newPermissions);
  };

  // 处理字段组的全选/取消全选
  const handleFieldGroupChange = (item: any, checked: boolean) => {
    let newPermissions = [...checkedPermissions];
    const fieldPermissions = getAllFieldPermissions(item);
    
    if (checked) {
      // 添加所有字段权限
      fieldPermissions.forEach(permission => {
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission);
        }
      });
    } else {
      // 移除所有字段权限
      newPermissions = newPermissions.filter(p => !fieldPermissions.includes(p));
    }
    
    setCheckedPermissions(newPermissions);
  };

  // 检查权限是否被选中
  const isPermissionChecked = (permission: string) => {
    return checkedPermissions.includes(permission);
  };

  // 检查菜单项是否为半选状态（部分子权限被选中）
  const isMenuItemIndeterminate = (item: any) => {
    if (!item.children && !item.functions) return false;
    
    const directChildPermissions = getDirectChildPermissions(item);
    const hasCheckedChild = directChildPermissions.some(permission => 
      checkedPermissions.includes(permission)
    );
    const allChildrenChecked = directChildPermissions.every(permission => 
      checkedPermissions.includes(permission)
    );
    
    return hasCheckedChild && !allChildrenChecked;
  };

  // 检查字段组是否为半选状态（部分字段被选中）
  const isFieldGroupIndeterminate = (item: any) => {
    if (!item.fields) return false;
    
    const fieldPermissions = getAllFieldPermissions(item);
    const hasCheckedField = fieldPermissions.some(permission => 
      checkedPermissions.includes(permission)
    );
    const allFieldsChecked = fieldPermissions.every(permission => 
      checkedPermissions.includes(permission)
    );
    
    return hasCheckedField && !allFieldsChecked;
  };

  // 检查字段组是否全选
  const isFieldGroupChecked = (item: any) => {
    if (!item.fields) return false;
    
    const fieldPermissions = getAllFieldPermissions(item);
    return fieldPermissions.every(permission => 
      checkedPermissions.includes(permission)
    );
  };

  // 渲染菜单和功能权限
  const renderMenuFunctionItem = (item: any) => {
    return (
      <Card 
        key={item.key} 
        title={
          <Checkbox
            checked={isPermissionChecked(item.key)}
            indeterminate={isMenuItemIndeterminate(item)}
            onChange={(e) => handlePermissionChange(item, e.target.checked)}
          >
            {item.title}
          </Checkbox>
        }
        style={{ marginBottom: 16 }}
      >
        {item.functions && (
          <div style={{ marginLeft: 24, marginBottom: 8 }}>
            <Space wrap>
              {item.functions.map((func: any) => (
                <Checkbox
                  key={func.value}
                  checked={isPermissionChecked(func.value)}
                  onChange={(e) => handlePermissionChange(func, e.target.checked)}
                >
                  {func.label}
                </Checkbox>
              ))}
            </Space>
          </div>
        )}
        
        {item.children && (
          <div style={{ marginLeft: 24 }}>
            {item.children.map((child: any) => (
              <Card 
                key={child.key} 
                type="inner" 
                title={
                  <Checkbox
                    checked={isPermissionChecked(child.key)}
                    indeterminate={isMenuItemIndeterminate(child)}
                    onChange={(e) => handlePermissionChange(child, e.target.checked)}
                  >
                    {child.title}
                  </Checkbox>
                }
                style={{ marginBottom: 8 }}
              >
                {child.functions && (
                  <div style={{ marginLeft: 24 }}>
                    <Space wrap>
                      {child.functions.map((func: any) => (
                        <Checkbox
                          key={func.value}
                          checked={isPermissionChecked(func.value)}
                          onChange={(e) => handlePermissionChange(func, e.target.checked)}
                        >
                          {func.label}
                        </Checkbox>
                      ))}
                    </Space>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    );
  };

  // 渲染字段权限
  const renderFieldPermissionItem = (item: any) => {
    return (
      <Card 
        key={item.key} 
        title={
          <Checkbox
            checked={isFieldGroupChecked(item)}
            indeterminate={isFieldGroupIndeterminate(item)}
            onChange={(e) => handleFieldGroupChange(item, e.target.checked)}
          >
            {item.title}
          </Checkbox>
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ marginLeft: 24 }}>
          <Space wrap>
            {item.fields.map((field: any) => (
              <Checkbox
                key={field.value}
                checked={isPermissionChecked(field.value)}
                onChange={(e) => handleFieldPermissionChange(field, e.target.checked)}
              >
                {field.label}
              </Checkbox>
            ))}
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <ModalForm
      title="编辑权限"
      width="800px"
      visible={props.permissionModalVisible}
      onVisibleChange={(visible) => {
        if (!visible) {
          props.onCancel();
        }
      }}
      onFinish={async () => {
        await props.onSubmit({ permissions: checkedPermissions });
        return true;
      }}
      modalProps={{
        onCancel: () => {
          props.onCancel();
        },
      }}
      initialValues={{ permissions: props.values.permissions }}
    >
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="菜单与功能权限" key="menuFunction">
          <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '8px' }}>
            {menuFunctionData.map(renderMenuFunctionItem)}
          </div>
        </TabPane>
        <TabPane tab="字段权限" key="field">
          <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '8px' }}>
            {fieldPermissionData.map(renderFieldPermissionItem)}
          </div>
        </TabPane>
      </Tabs>
    </ModalForm>
  );
};

export default PermissionForm; 