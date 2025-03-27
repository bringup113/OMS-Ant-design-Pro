-- 添加字段
ALTER TABLE supplier_profits 
ADD COLUMN IF NOT EXISTS order_id INTEGER;

ALTER TABLE supplier_profits 
ADD COLUMN IF NOT EXISTS order_business_id INTEGER;

-- 如果之前的约束已存在，先删除
ALTER TABLE supplier_profits DROP CONSTRAINT IF EXISTS FK_supplier_profits_order;
ALTER TABLE supplier_profits DROP CONSTRAINT IF EXISTS FK_supplier_profits_order_business;

-- 添加外键约束
ALTER TABLE supplier_profits
ADD CONSTRAINT FK_supplier_profits_order
FOREIGN KEY (order_id) 
REFERENCES orders(id)
ON DELETE CASCADE;

ALTER TABLE supplier_profits
ADD CONSTRAINT FK_supplier_profits_order_business
FOREIGN KEY (order_business_id) 
REFERENCES order_businesses(id)
ON DELETE CASCADE; 