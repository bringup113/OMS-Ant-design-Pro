import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// 加载环境变量
config();

const configService = new ConfigService();

// 创建数据源
const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT') || '5432', 10),
  username: configService.get('DB_USERNAME') || 'postgres',
  password: configService.get('DB_PASSWORD') || 'postgres',
  database: configService.get('DB_DATABASE') || 'oms',
  entities: [],
});

// 需要检查的表和字段
const tablesToCheck = [
  { table: 'organizations', fields: ['name'] },
  { table: 'users', fields: ['username', 'password', 'name'] },
  { table: 'roles', fields: ['code', 'name'] },
  { table: 'permissions', fields: ['code', 'name', 'type'] },
];

async function main() {
  try {
    // 初始化连接
    await dataSource.initialize();
    console.log('数据库连接已初始化');

    // 检查所有表的空值
    for (const tableInfo of tablesToCheck) {
      const { table, fields } = tableInfo;
      
      // 检查表是否存在
      const tableExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        );
      `);
      
      if (!tableExists[0].exists) {
        console.log(`表 ${table} 不存在，跳过检查`);
        continue;
      }

      console.log(`\n检查表 ${table}:`);
      
      // 检查每个字段
      for (const field of fields) {
        // 检查字段是否存在
        const columnExists = await dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${table}' 
            AND column_name = '${field}'
          );
        `);
        
        if (!columnExists[0].exists) {
          console.log(`  字段 ${field} 不存在，跳过检查`);
          continue;
        }

        // 查询空值记录
        const nullCount = await dataSource.query(`
          SELECT COUNT(*) FROM ${table} 
          WHERE ${field} IS NULL OR ${field} = '';
        `);
        
        const count = parseInt(nullCount[0].count);
        
        if (count > 0) {
          console.log(`  ⚠️ 字段 ${field} 有 ${count} 条空值记录`);
          
          // 获取前5条空值记录的ID
          const nullRecords = await dataSource.query(`
            SELECT id FROM ${table} 
            WHERE ${field} IS NULL OR ${field} = ''
            LIMIT 5;
          `);
          
          const ids = nullRecords.map(record => record.id).join(', ');
          console.log(`  示例ID: ${ids}${nullRecords.length < count ? ', ...' : ''}`);
          
          // 提供删除语句
          console.log(`  删除语句: DELETE FROM ${table} WHERE ${field} IS NULL OR ${field} = '';`);
          console.log(`  或者更新语句: UPDATE ${table} SET ${field} = '默认值-' || id WHERE ${field} IS NULL OR ${field} = '';`);
        } else {
          console.log(`  ✓ 字段 ${field} 没有空值记录`);
        }
      }
    }

    // 关闭连接
    await dataSource.destroy();
    console.log('\n数据库连接已关闭');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main(); 