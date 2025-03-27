import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProductItemsSequence1742163655803 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 创建一个新的序列给product_items表使用
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS product_items_id_seq`);
        
        // 2. 修改product_items表的id列，使用新的序列
        await queryRunner.query(`ALTER TABLE product_items ALTER COLUMN id SET DEFAULT nextval('product_items_id_seq')`);
        
        // 3. 设置新序列的当前值为当前最大id值
        await queryRunner.query(`SELECT setval('product_items_id_seq', COALESCE((SELECT MAX(id) FROM product_items), 1), false)`);
        
        // 4. 现在可以安全地删除products表了
        await queryRunner.query(`DROP TABLE IF EXISTS products CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 恢复操作比较复杂，需要重新创建products表和相关依赖
        // 这里只提供一个基本的恢复操作
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category_id INTEGER NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'offline',
            sort INTEGER DEFAULT 100,
            created_by INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )`);
        
        // 恢复product_items表的id列依赖
        await queryRunner.query(`ALTER TABLE product_items ALTER COLUMN id SET DEFAULT nextval('products_id_seq')`);
        
        // 删除我们创建的序列
        await queryRunner.query(`DROP SEQUENCE IF EXISTS product_items_id_seq`);
    }

}
