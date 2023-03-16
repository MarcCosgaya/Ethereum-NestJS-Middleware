import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContractsController } from './contracts.controller';

@Module({
  controllers: [ContractsController],
  imports: [PrismaModule]
})
export class ContractsModule {}
