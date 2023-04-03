import { Module } from '@nestjs/common';
import { ContractsModule } from 'src/contracts/contracts.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
    imports: [ContractsModule, TransactionsModule]
})
export class AppModule {}
