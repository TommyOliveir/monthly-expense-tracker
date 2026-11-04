import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { getAllowedOrigins } from '@/common/cors/get-allowed-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configure CORS
  app.enableCors({
    origin: getAllowedOrigins(process.env.FRONTEND_URL),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, // Allows authorization headers / cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth() // 👈 Adds JWT Authorization button in Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  // Railway needs PORT + 0.0.0.0
  const port = process.env.PORT ?? 3001;

  await app.listen(port, '0.0.0.0');
}

bootstrap();
