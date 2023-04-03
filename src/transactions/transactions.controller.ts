import { Controller, Get, Body, Post, Put, ConflictException, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { SendDto } from './dtos/send.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { GetOneDto } from './dtos/get-one.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    @Post() // Send ethers to address.
    // body.to: Address to send to.
    // body.quant: Quantity (in ethers).
    // Returns tx information.
    send(@Body() body: SendDto) {
        const { to, quant } = body;
        return this.transactionsService.send(to, quant);
    }

    @Get() // Get list of all cached txs.
    // Returns list of tx.
    getAll() {
        return this.transactionsService.getAll();
    }

    @Get(':txHash') // Get a single tx.
    // txHash: hash of the tx.
    // Returns a single tx.
    getOne(@Param() queryParams: GetOneDto) {
        return this.transactionsService.getOne(queryParams.txHash)
    }

    @Put() // Update contract in DB from already deployed contract.
    // body.hash: Hash of the tx.
    // Returns tx information.
    updateTransaction(@Body() body: UpdateTransactionDto) {
        const { hash } = body;
        return this.transactionsService.updateTransaction(hash);
    }
}
