import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductQuotationsTable1742173652228 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "product_quotations",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "product_id",
                        type: "int",
                    },
                    {
                        name: "supplier_id",
                        type: "int",
                    },
                    {
                        name: "price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "currency",
                        type: "varchar",
                        length: "3",
                        default: "'CNY'",
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "20",
                        default: "'active'",
                    },
                    {
                        name: "remark",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "is_latest",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "created_by",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // 添加外键约束
        await queryRunner.createForeignKey(
            "product_quotations",
            new TableForeignKey({
                columnNames: ["product_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "product_items",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "product_quotations",
            new TableForeignKey({
                columnNames: ["supplier_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "organizations",
                onDelete: "CASCADE",
            })
        );

        // 添加索引
        await queryRunner.query(`
            CREATE INDEX idx_product_quotations_product_id ON product_quotations (product_id);
            CREATE INDEX idx_product_quotations_supplier_id ON product_quotations (supplier_id);
            CREATE INDEX idx_product_quotations_is_latest ON product_quotations (is_latest);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束
        const table = await queryRunner.getTable("product_quotations");
        if (table) {
            const foreignKeys = table.foreignKeys;
            
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("product_quotations", foreignKey);
            }
        }
        
        // 删除表
        await queryRunner.dropTable("product_quotations");
    }
}
