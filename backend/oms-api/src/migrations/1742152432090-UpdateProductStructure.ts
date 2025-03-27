import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductStructure1742152432090 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 修改产品类别表的状态字段
        // 修改表结构，将status列的长度从1改为20
        await queryRunner.query(`ALTER TABLE product_categories ALTER COLUMN status TYPE VARCHAR(20)`);
        await queryRunner.query(`ALTER TABLE product_categories ALTER COLUMN status SET DEFAULT 'enabled'`);
        
        // 更新数据，将'1'改为'enabled'，将'0'改为'disabled'
        await queryRunner.query(`UPDATE product_categories SET status = 'enabled' WHERE status = '1'`);
        await queryRunner.query(`UPDATE product_categories SET status = 'disabled' WHERE status = '0'`);

        // 2. 重命名表
        // 先备份原表结构
        await queryRunner.query(`
            CREATE TABLE product_items (LIKE products INCLUDING ALL)
        `);
        
        // 复制数据
        await queryRunner.query(`
            INSERT INTO product_items SELECT * FROM products
        `);
        
        // 更新外键关系
        await queryRunner.query(`
            ALTER TABLE product_items 
            DROP CONSTRAINT IF EXISTS product_items_category_id_fkey;
            
            ALTER TABLE product_items
            ADD CONSTRAINT product_items_category_id_fkey
            FOREIGN KEY (category_id) REFERENCES product_categories(id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. 恢复表名
        // 恢复外键关系
        await queryRunner.query(`
            ALTER TABLE product_items 
            DROP CONSTRAINT IF EXISTS product_items_category_id_fkey;
        `);
        
        // 删除新表
        await queryRunner.query(`
            DROP TABLE IF EXISTS product_items;
        `);
        
        // 2. 恢复产品类别表的状态字段
        // 回滚数据，将'enabled'改为'1'，将'disabled'改为'0'
        await queryRunner.query(`UPDATE product_categories SET status = '1' WHERE status = 'enabled'`);
        await queryRunner.query(`UPDATE product_categories SET status = '0' WHERE status = 'disabled'`);
        
        // 修改表结构，将status列的长度从20改回1
        await queryRunner.query(`ALTER TABLE product_categories ALTER COLUMN status TYPE VARCHAR(1)`);
        await queryRunner.query(`ALTER TABLE product_categories ALTER COLUMN status SET DEFAULT '1'`);
    }
}
