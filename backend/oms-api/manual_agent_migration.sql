-- 添加字段
ALTER TABLE agent_profits 
ADD COLUMN IF NOT EXISTS order_id INTEGER;

ALTER TABLE agent_profits 
ADD COLUMN IF NOT EXISTS order_business_id INTEGER;

-- 如果之前的约束已存在，先删除
ALTER TABLE agent_profits DROP CONSTRAINT IF EXISTS FK_agent_profits_order;
ALTER TABLE agent_profits DROP CONSTRAINT IF EXISTS FK_agent_profits_order_business;

-- 添加外键约束
ALTER TABLE agent_profits
ADD CONSTRAINT FK_agent_profits_order
FOREIGN KEY (order_id) 
REFERENCES orders(id)
ON DELETE CASCADE;

ALTER TABLE agent_profits
ADD CONSTRAINT FK_agent_profits_order_business
FOREIGN KEY (order_business_id) 
REFERENCES order_businesses(id)
ON DELETE CASCADE; 