import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrderTables1742389856000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建订单表
        await queryRunner.createTable(
            new Table({
                name: "orders",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "customer_id",
                        type: "int",
                    },
                    {
                        name: "total_amount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "payment_status",
                        type: "varchar",
                        length: "20",
                        default: "'unpaid'",
                    },
                    {
                        name: "account_status",
                        type: "varchar",
                        length: "20",
                        default: "'unrecorded'",
                    },
                    {
                        name: "agent_id",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "remark",
                        type: "text",
                        isNullable: true,
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

        // 创建订单业务表
        await queryRunner.createTable(
            new Table({
                name: "order_businesses",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "order_id",
                        type: "int",
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
                        name: "cost_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "agent_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "sale_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "20",
                        default: "'pending'",
                    },
                    {
                        name: "remark",
                        type: "text",
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
            "orders",
            new TableForeignKey({
                columnNames: ["customer_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "customers",
                onDelete: "RESTRICT",
            })
        );

        await queryRunner.createForeignKey(
            "order_businesses",
            new TableForeignKey({
                columnNames: ["order_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "orders",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "order_businesses",
            new TableForeignKey({
                columnNames: ["product_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "product_items",
                onDelete: "RESTRICT",
            })
        );

        await queryRunner.createForeignKey(
            "order_businesses",
            new TableForeignKey({
                columnNames: ["supplier_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "organizations",
                onDelete: "RESTRICT",
            })
        );

        // 添加索引
        await queryRunner.query(`
            CREATE INDEX idx_orders_customer_id ON orders (customer_id);
            CREATE INDEX idx_orders_payment_status ON orders (payment_status);
            CREATE INDEX idx_orders_account_status ON orders (account_status);
            CREATE INDEX idx_order_businesses_order_id ON order_businesses (order_id);
            CREATE INDEX idx_order_businesses_product_id ON order_businesses (product_id);
            CREATE INDEX idx_order_businesses_supplier_id ON order_businesses (supplier_id);
            CREATE INDEX idx_order_businesses_status ON order_businesses (status);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除表（外键会自动删除）
        await queryRunner.dropTable("order_businesses");
        await queryRunner.dropTable("orders");
    }
} 