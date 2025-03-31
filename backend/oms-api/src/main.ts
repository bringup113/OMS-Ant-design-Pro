import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 打印环境信息
  console.log('=== 订单管理系统API服务启动 ===');
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`版本: ${process.env.npm_package_version || '1.0.0'}`);
  console.log('===============================');
  
  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // 启用CORS
  app.enableCors();
  
  // 设置全局前缀
  app.setGlobalPrefix('api');
  
  // 获取配置服务
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
