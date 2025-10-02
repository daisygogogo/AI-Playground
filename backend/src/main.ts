import type { LogLevel } from '@nestjs/common';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from './app.module';
import { AppConfigService } from './features/app-config/app-config.service';
import { ExceptionsFilter } from './core/filters/exceptions.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { Environment } from './core/enums/environment.enum';
import * as express from 'express';

// eslint-disable-next-line max-lines-per-function,max-statements
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const minimumLoggerLevels: LogLevel[] = ['log', 'error', 'warn'];

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.ENVIRONMENT === Environment.PRODUCTION
        ? minimumLoggerLevels
        : [...minimumLoggerLevels, 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // to load local file
  app.use('/storage', express.static('storage'));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
    new ExceptionsFilter(httpAdapter),
  );

  const appConfigService = app.get(AppConfigService);
  app.use(
    helmet({
      contentSecurityPolicy:
        appConfigService.environment === (Environment.LOCALHOST as string) ? false : undefined,
    }),
  );

  app.use(cookieParser());
  app.enableCors({
    origin: ['https://contact-management-app-158.vercel.app', 'http://localhost:4001', 'http://localhost:3001','http://localhost:3000'],
    credentials: true,
  });

  // 移除API版本化
  // const API_VERSION = 'v1';
  // app.setGlobalPrefix(API_VERSION);
  // app.enableVersioning({
  //   type: VersioningType.URI,
  // });

  app.enableShutdownHooks();

  // const ONE_MINUTE = 60 * 1000;
  // const CONNECTIONS_LIMIT = 500;
  // app.use(
  //   rateLimit({
  //     windowMs: ONE_MINUTE,
  //     limit: CONNECTIONS_LIMIT,
  //     skip: (request) => request.path.includes('analytics'),
  //   }),
  // );

  app.use(compression());

  if (appConfigService.isSwaggerEnabled) {
    const options = new DocumentBuilder()
      .setTitle(appConfigService.name)
      .setDescription(appConfigService.swaggerDescription)
      .setVersion(appConfigService.swaggerVersion)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(appConfigService.swaggerPath, app, document);
  }

  const port = String(appConfigService.port);
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is listening on port ${port} on all network interfaces`);

  // 优雅关闭处理
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully');
    await app.close();
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully');
    await app.close();
  });
}

void bootstrap();
