import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderCommentsTable1743280000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_comments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'order_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: true,
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 添加外键约束 - 订单关联
    await queryRunner.createForeignKey(
      'order_comments',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    );

    // 添加外键约束 - 用户关联
    await queryRunner.createForeignKey(
      'order_comments',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 先删除外键约束
    const table = await queryRunner.getTable('order_comments');
    if (table) {
      const orderForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('order_id') !== -1,
      );
      if (orderForeignKey) {
        await queryRunner.dropForeignKey('order_comments', orderForeignKey);
      }

      const userForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('created_by') !== -1,
      );
      if (userForeignKey) {
        await queryRunner.dropForeignKey('order_comments', userForeignKey);
      }
    }

    // 然后删除表
    await queryRunner.dropTable('order_comments');
  }
} 