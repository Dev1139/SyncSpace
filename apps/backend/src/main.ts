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
  const configuredFrontendUrls =
    process.env.FRONTEND_URL?.split(',')
      .map((url) => url.trim())
      .filter(Boolean) || [];
  const frontendUrls =
    configuredFrontendUrls.length > 0
      ? configuredFrontendUrls
      : ['http://localhost:5173'];

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const prisma = app.get(PrismaService);

  await app.listen(process.env.PORT ?? 3000);
  createWSServer(prisma, app.getHttpServer());
}

bootstrap();
