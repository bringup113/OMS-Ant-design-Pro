-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  account_status VARCHAR(20) NOT NULL DEFAULT 'unrecorded',
  agent_id INTEGER,
  remark TEXT,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建订单业务表
CREATE TABLE IF NOT EXISTS order_businesses (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  supplier_id INTEGER NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  agent_price DECIMAL(10,2),
  sale_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  remark TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建外键约束
ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_customer 
  FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_agent 
  FOREIGN KEY (agent_id) REFERENCES agents(id);

ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_user 
  FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE order_businesses 
  ADD CONSTRAINT fk_order_businesses_order 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_businesses 
  ADD CONSTRAINT fk_order_businesses_product 
  FOREIGN KEY (product_id) REFERENCES product_items(id);

ALTER TABLE order_businesses 
  ADD CONSTRAINT fk_order_businesses_supplier 
  FOREIGN KEY (supplier_id) REFERENCES organizations(id);

-- 创建索引以提高查询性能
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_agent_id ON orders(agent_id);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_account_status ON orders(account_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_businesses_order_id ON order_businesses(order_id);
CREATE INDEX idx_order_businesses_product_id ON order_businesses(product_id);
CREATE INDEX idx_order_businesses_supplier_id ON order_businesses(supplier_id);
CREATE INDEX idx_order_businesses_status ON order_businesses(status); 