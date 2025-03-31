import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, Table } from 'typeorm';

export class AddOrganizationIdToCustomers1711623636000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加organization_id列
        await queryRunner.addColumn('customers', new TableColumn({
            name: 'organization_id',
            type: 'int',
            isNullable: true // 设置为可空，以便于数据迁移
        }));

        // 添加外键约束
        await queryRunner.createForeignKey('customers', new TableForeignKey({
            columnNames: ['organization_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'organizations',
            onDelete: 'SET NULL'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束
        const maybeTable = await queryRunner.getTable('customers');
        if (maybeTable) {
            const foreignKey = maybeTable.foreignKeys.find(fk => fk.columnNames.indexOf('organization_id') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('customers', foreignKey);
            }
        }

        // 删除organization_id列
        await queryRunner.dropColumn('customers', 'organization_id');
    }
} 