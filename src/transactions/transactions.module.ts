import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  imports: [PrismaModule],
  exports: [TransactionsService],
  providers: [TransactionsService]
})
export class TransactionsModule {}
