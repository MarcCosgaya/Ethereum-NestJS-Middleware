import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  controllers: [ContractsController],
  imports: [PrismaModule, TransactionsModule],
  providers: [ContractsService]
})
export class ContractsModule {}
