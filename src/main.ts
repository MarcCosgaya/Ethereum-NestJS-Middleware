import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './app/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const swaggerOptions = {
    operationsSorter: 'alpha',
  };
  const config = new DocumentBuilder()
    .setTitle('Ethereum-NestJS-Middleware')
    .setDescription('NestJS API for interacting with the Ethereum blockchain.')
    .setVersion('0.0.3')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { swaggerOptions });

  app.useGlobalPipes(new ValidationPipe({
    whitelist:true
  }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000);
}
bootstrap();
