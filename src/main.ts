import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ContractsModule } from './contracts/contracts.module';

async function bootstrap() {
  const app = await NestFactory.create(ContractsModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true
  }));
  await app.listen(3000);
}
bootstrap();
