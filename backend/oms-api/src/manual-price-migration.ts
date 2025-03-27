import AppDataSource from './database/data-source';

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('连接数据库成功');

    console.log('正在添加 agent_price 字段...');
    await AppDataSource.query(`ALTER TABLE "product_quotations" ADD COLUMN IF NOT EXISTS "agent_price" decimal(10,2)`);
    
    console.log('正在添加 sale_price 字段...');
    await AppDataSource.query(`ALTER TABLE "product_quotations" ADD COLUMN IF NOT EXISTS "sale_price" decimal(10,2)`);
    
    console.log('迁移完成');
    
    // 在迁移记录表中添加记录
    await AppDataSource.query(`
      INSERT INTO migrations(timestamp, name)
      VALUES(1742306007720, 'AddPriceFieldsToProductQuotations1742306007720')
      ON CONFLICT DO NOTHING
    `);

    console.log('迁移记录已添加');
    
    await AppDataSource.destroy();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

runMigration()
  .then(() => {
    console.log('迁移脚本完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('迁移脚本失败:', error);
    process.exit(1);
  }); 