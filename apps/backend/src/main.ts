import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './prisma/prisma.service';
import { createWSServer } from './realtime/ws.server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // interceptors + filters
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const prisma = app.get(PrismaService);

  // 🔥 START WS SERVER
  createWSServer(prisma);

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `HTTP Server running on http://localhost:${process.env.PORT ?? 3000}`,
  );
}

bootstrap();
