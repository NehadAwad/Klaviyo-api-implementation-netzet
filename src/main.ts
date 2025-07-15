import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ level, message, timestamp, stack }) => {
            // print stack trace for errors, otherwise plain message
            return `${timestamp} [${level}]: ${stack || message}`;
          }),
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('Netzet Klaviyo API')
    .setDescription('Backend system to interact with Klaviyo')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  // expose docs at /docs
  SwaggerModule.setup('docs', app, document);

  // list registered routes once app is ready
  const server = app.getHttpServer();
  const router =
    server._events.request?.router ?? server._events.request?._router;
  if (router && router.stack) {
    logger.log('info', 'Registered Endpoints:');
    router.stack
      .filter((layer) => layer.route)
      .forEach((layer) => {
        const { methods, path } = layer.route;
        const method = Object.keys(methods)[0]?.toUpperCase();
        logger.log('info', `${method.padEnd(6)} ${path}`);
      });
  }
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const baseUrl = await app.getUrl();
  console.log(`Application is running on: ${baseUrl}/${globalPrefix}`);
  console.log(`API Documentation available at: ${baseUrl}/docs`);
}
bootstrap();
