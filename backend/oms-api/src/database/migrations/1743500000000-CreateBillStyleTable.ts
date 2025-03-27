import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateBillStyleTable1743500000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建账单样式模板表
        await queryRunner.createTable(
            new Table({
                name: "bill_style_templates",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "is_default",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "paper_type",
                        type: "varchar",
                        length: "20",
                        default: "'a4'",
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

        // 创建账单元素表
        await queryRunner.createTable(
            new Table({
                name: "bill_style_elements",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "template_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "element_id",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "content",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "align",
                        type: "varchar",
                        length: "20",
                        default: "'left'",
                    },
                    {
                        name: "section",
                        type: "varchar",
                        length: "20",
                        isNullable: false,
                        comment: "header, body, footer"
                    },
                    {
                        name: "is_bold",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "is_title",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "font_size",
                        type: "int",
                        default: 12,
                    },
                    {
                        name: "sort_order",
                        type: "int",
                        default: 0,
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

        // 添加外键
        await queryRunner.createForeignKey(
            "bill_style_elements",
            new TableForeignKey({
                columnNames: ["template_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "bill_style_templates",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 先删除外键
        const table = await queryRunner.getTable("bill_style_elements");
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("template_id") !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey("bill_style_elements", foreignKey);
        }

        // 删除表
        await queryRunner.dropTable("bill_style_elements");
        await queryRunner.dropTable("bill_style_templates");
    }
} 