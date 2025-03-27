import React from 'react';
import { Divider, Table } from 'antd';
import styles from './index.less';

interface Business {
  id: number;
  product?: {
    name: string;
  };
  supplier?: {
    name: string;
  };
  salePrice: number;
  remark?: string;
}

interface Customer {
  id: number;
  name: string;
  passportNo: string;
}

interface Order {
  id: number;
  customer?: Customer;
  businesses?: Business[];
}

interface Element {
  id: number | string;
  elementId?: string;
  type: 'text' | 'line' | 'order-item' | 'total' | 'custom-field' | 'remark';
  content?: string;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isTitle?: boolean;
  fontSize?: number;
  section?: 'header' | 'body' | 'footer';
  sortOrder?: number;
}

interface BillTemplateProps {
  companyName?: string;
  billId?: number;
  billDate?: string;
  agentName?: string;
  orders?: Order[];
  totalAmount?: number;
  remark?: string;
  // 新增模板相关属性
  templateData?: {
    id: number;
    name: string;
    headerElements?: Element[];
    bodyElements?: Element[];
    footerElements?: Element[];
    elements?: Element[];
  };
}

// 打印模板组件
const BillTemplate: React.FC<BillTemplateProps> = ({
  companyName = '天成旅行社',
  billId,
  billDate,
  agentName,
  orders = [],
  totalAmount = 0,
  remark,
  templateData,
}) => {
  // 将所有业务数据转换为表格行
  const tableData = orders.flatMap(order => 
    (order.businesses || []).map(business => ({
      key: `${order.id}-${business.id}`,
      orderId: order.id,
      customerId: order.customer?.id,
      customerName: order.customer?.name || '-',
      passportNo: order.customer?.passportNo || '-',
      businessName: business.product?.name || '-',
      price: business.salePrice,
      remark: business.remark || '-',
    }))
  );

  // 对业务数据按照客户分组
  const groupedData: Record<string, any[]> = {};
  tableData.forEach(item => {
    const key = `${item.customerId}-${item.customerName}`;
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(item);
  });

  // 合并相同客户的数据，避免重复显示
  const mergedTableData = tableData.reduce((acc, curr) => {
    // 查找当前列表中是否已有相同客户
    const existingCustomerIndex = acc.findIndex(item => 
      item.customerId === curr.customerId && 
      item.customerName === curr.customerName
    );

    if (existingCustomerIndex >= 0) {
      // 如果找到相同客户，合并数据，但保留业务信息
      acc.push({
        ...curr,
        // 对于已合并的条目，不再显示客户信息
        mergedCustomer: true
      });
    } else {
      // 第一次出现的客户，保留完整信息
      acc.push(curr);
    }
    return acc;
  }, [] as any[]);

  // 表格列定义
  const columns = [
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string, record: any) => {
        return record.mergedCustomer ? '' : text;
      },
    },
    {
      title: '护照号码',
      dataIndex: 'passportNo',
      key: 'passportNo',
      render: (text: string, record: any) => {
        return record.mergedCustomer ? '' : text;
      },
    },
    {
      title: '业务名称',
      dataIndex: 'businessName',
      key: 'businessName',
    },
    {
      title: '业务价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: any) => {
        // 确保price是数字类型
        const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
        return `$${numericPrice.toFixed(2)}`;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
  ];

  // 替换内容中的占位符
  const replaceContentPlaceholders = (content: string = '') => {
    return content
      .replace('{date}', billDate || '')
      .replace('{billNo}', String(billId) || '')
      .replace('{agentName}', agentName || '无代理')
      .replace('{totalAmount}', `$${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'}`);
  };

  // 根据元素类型渲染不同内容
  const renderElement = (element: Element) => {
    const { type, content, align = 'left', isBold, isTitle, fontSize } = element;
    const style: React.CSSProperties = {
      textAlign: align,
      fontWeight: isBold ? 'bold' : 'normal',
      fontSize: fontSize ? `${fontSize}px` : isTitle ? '18px' : '14px',
      margin: '8px 0',
    };

    switch (type) {
      case 'text':
        return <div style={style}>{replaceContentPlaceholders(content)}</div>;
      case 'line':
        return <Divider style={{ margin: '10px 0' }} />;
      case 'order-item':
        // 渲染HTML表格，实现真正的行合并
        return (
          <table className={styles.orderTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ 
                  padding: '8px', 
                  border: '1px solid #e8e8e8', 
                  backgroundColor: '#f5f5f5', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  width: '14%',
                  fontSize: '13px'
                }}>护照名称</th>
                <th style={{ 
                  padding: '8px', 
                  border: '1px solid #e8e8e8', 
                  backgroundColor: '#f5f5f5', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  width: '14%',
                  fontSize: '13px'
                }}>护照号码</th>
                <th style={{ 
                  padding: '8px', 
                  border: '1px solid #e8e8e8', 
                  backgroundColor: '#f5f5f5', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  width: '34%',
                  fontSize: '13px'
                }}>业务名称</th>
                <th style={{ 
                  padding: '8px', 
                  border: '1px solid #e8e8e8', 
                  backgroundColor: '#f5f5f5', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  width: '24%',
                  fontSize: '13px'
                }}>备注</th>
                <th style={{ 
                  padding: '8px', 
                  border: '1px solid #e8e8e8', 
                  backgroundColor: '#f5f5f5', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  width: '14%',
                  fontSize: '13px'
                }}>业务价格</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([customerKey, items]) => (
                items.map((item, index) => (
                  <tr key={item.key}>
                    {index === 0 ? (
                      <>
                        <td 
                          rowSpan={items.length} 
                          style={{ 
                            padding: '8px', 
                            border: '1px solid #e8e8e8', 
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            backgroundColor: '#f9f9f9',
                            fontSize: '12px'
                          }}
                        >
                          {item.customerName}
                        </td>
                        <td 
                          rowSpan={items.length} 
                          style={{ 
                            padding: '8px', 
                            border: '1px solid #e8e8e8', 
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            backgroundColor: '#f9f9f9',
                            fontSize: '12px'
                          }}
                        >
                          {item.passportNo}
                        </td>
                      </>
                    ) : null}
                    <td style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>
                      {item.businessName}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>
                      {item.remark}
                    </td>
                    <td className="price-cell" style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', paddingRight: '15px', fontSize: '12px' }}>
                      ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(String(item.price)).toFixed(2)}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ padding: '6px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold' }}>
                  小计:
                </td>
                <td style={{ padding: '6px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                  ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : parseFloat(String(totalAmount)).toFixed(2) || '0.00'}
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: '6px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold' }}>
                  已付金额:
                </td>
                <td style={{ padding: '6px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                  $0.00
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ padding: '6px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold' }}>
                  合计:
                </td>
                <td style={{ padding: '6px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                  ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : parseFloat(String(totalAmount)).toFixed(2) || '0.00'}
                </td>
              </tr>
            </tfoot>
          </table>
        );
      case 'total':
        return (
          <div style={{ marginTop: '20px' }}>
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
              总计: ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'}
            </div>
          </div>
        );
      case 'remark':
        return remark ? (
          <div style={{ marginTop: '10px', fontSize: '12px' }}>
            <div style={{ fontWeight: 'bold' }}>备注:</div>
            <div>{remark}</div>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  // 使用自定义模板渲染
  if (templateData && (templateData.headerElements || templateData.bodyElements || templateData.footerElements)) {
    return (
      <div className={styles.billTemplate}>
        {/* 头部区域 */}
        <div className={styles.header}>
          {templateData.headerElements?.map((element) => (
            <div key={element.id || element.elementId}>
              {renderElement(element)}
            </div>
          ))}
        </div>
        
        {/* 主体区域 */}
        <div className={styles.body}>
          {templateData.bodyElements?.map((element) => (
            <div key={element.id || element.elementId}>
              {renderElement(element)}
            </div>
          ))}
        </div>
        
        {/* 底部区域 */}
        <div className={styles.footer}>
          {templateData.footerElements?.map((element) => (
            <div key={element.id || element.elementId}>
              {renderElement(element)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 默认模板渲染
  return (
    <div className={styles.billTemplate} style={{ maxWidth: '160mm', margin: '0 auto', fontSize: '12px' }}>
      {/* 头部 */}
      <div className={styles.header} style={{ marginBottom: '15px' }}>
        <h1 className={styles.companyName} style={{ fontSize: '18px', marginBottom: '8px' }}>{companyName}</h1>
        <div className={styles.billInfo}>
          <p style={{ margin: '2px 0' }}>账单日期: {billDate}</p>
          {agentName && agentName !== '无代理' && (
            <p style={{ margin: '2px 0' }}>客户名称: {agentName}</p>
          )}
        </div>
      </div>
      
      {/* 订单明细 */}
      <div className={styles.orderDetails} style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <h2 className="section-title" style={{ fontSize: '14px', marginBottom: '8px', textAlign: 'center' }}>订单明细</h2>
        
        {/* 使用原生HTML表格代替Ant Design表格组件 */}
        <table className={styles.orderTable} style={{ width: '100%', maxWidth: '160mm', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ 
                padding: '8px', 
                border: '1px solid #e8e8e8', 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold', 
                textAlign: 'center',
                width: '14%',
                fontSize: '13px'
              }}>护照名称</th>
              <th style={{ 
                padding: '8px', 
                border: '1px solid #e8e8e8', 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold', 
                textAlign: 'center',
                width: '14%',
                fontSize: '13px'
              }}>护照号码</th>
              <th style={{ 
                padding: '8px', 
                border: '1px solid #e8e8e8', 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold', 
                textAlign: 'center',
                width: '34%',
                fontSize: '13px'
              }}>业务名称</th>
              <th style={{ 
                padding: '8px', 
                border: '1px solid #e8e8e8', 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold', 
                textAlign: 'center',
                width: '24%',
                fontSize: '13px'
              }}>备注</th>
              <th style={{ 
                padding: '8px', 
                border: '1px solid #e8e8e8', 
                backgroundColor: '#f5f5f5', 
                fontWeight: 'bold', 
                textAlign: 'center',
                width: '14%',
                fontSize: '13px'
              }}>业务价格</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([customerKey, items]) => (
              items.map((item, index) => (
                <tr key={item.key}>
                  {index === 0 ? (
                    <>
                      <td 
                        rowSpan={items.length} 
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #e8e8e8', 
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor: '#f9f9f9',
                          fontSize: '12px'
                        }}
                      >
                        {item.customerName}
                      </td>
                      <td 
                        rowSpan={items.length} 
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #e8e8e8', 
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          backgroundColor: '#f9f9f9',
                          fontSize: '12px'
                        }}
                      >
                        {item.passportNo}
                      </td>
                    </>
                  ) : null}
                  <td style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>
                    {item.businessName}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>
                    {item.remark}
                  </td>
                  <td className="price-cell" style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', paddingRight: '15px', fontSize: '12px' }}>
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(String(item.price)).toFixed(2)}
                  </td>
                </tr>
              ))
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan={4} style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                小计:
              </td>
              <td className="price-cell" style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', paddingRight: '15px', fontSize: '12px' }}>
                ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : parseFloat(String(totalAmount)).toFixed(2) || '0.00'}
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan={4} style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                已付金额:
              </td>
              <td className="price-cell" style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', paddingRight: '15px', fontSize: '12px' }}>
                $0.00
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan={4} style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                合计:
              </td>
              <td className="price-cell" style={{ padding: '8px', border: '1px solid #e8e8e8', textAlign: 'right', fontWeight: 'bold', paddingRight: '15px', fontSize: '12px' }}>
                ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : parseFloat(String(totalAmount)).toFixed(2) || '0.00'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* 备注信息 */}
      {remark && (
        <div className={styles.remarkSection} style={{ marginTop: '15px', border: '1px solid #e8e8e8', padding: '10px', backgroundColor: '#fafafa' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '13px' }}>备注信息:</h3>
          <p style={{ margin: '0', fontSize: '12px' }}>{remark}</p>
        </div>
      )}
      
      {/* 页脚 */}
      <div className="footer" style={{ marginTop: '20px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
        <p className={styles.footerText} style={{ margin: '3px 0' }}>感谢您的惠顾</p>
        <p className={styles.footerText} style={{ margin: '3px 0' }}>如有疑问，请联系我们</p>
      </div>
    </div>
  );
};

export default BillTemplate; 