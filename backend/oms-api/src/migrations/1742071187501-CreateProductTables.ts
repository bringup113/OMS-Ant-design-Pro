import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductTables1742071187501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建产品表
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'category_id',
            type: 'int',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'offline'",
          },
          {
            name: 'sort',
            type: 'int',
            default: 100,
          },
          {
            name: 'created_by',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 创建产品价格表
    await queryRunner.createTable(
      new Table({
        name: 'product_prices',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_id',
            type: 'int',
          },
          {
            name: 'supplier_id',
            type: 'int',
          },
          {
            name: 'cost_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'selling_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'CNY'",
          },
          {
            name: 'created_by',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 添加外键约束
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_categories',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'product_prices',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_prices',
      new TableForeignKey({
        columnNames: ['supplier_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键约束
    const productPricesTable = await queryRunner.getTable('product_prices');
    const productsTable = await queryRunner.getTable('products');
    
    if (productPricesTable) {
      const foreignKeys = productPricesTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('product_prices', foreignKey);
      }
    }

    if (productsTable) {
      const foreignKeys = productsTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('products', foreignKey);
      }
    }

    // 删除表
    await queryRunner.dropTable('product_prices');
    await queryRunner.dropTable('products');
  }
} 