// 入口文件
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Logger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  
  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 启用 CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 Server running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
