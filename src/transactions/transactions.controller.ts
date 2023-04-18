import { Controller, Get, Body, Post, Param, BadRequestException, Patch } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { SendDto, SendNewDto } from './dtos/send.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { GetOneDto } from './dtos/get-one.dto';
import { GetBalanceDto } from './dtos/get-balance.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    @Post() // Send ethers to address.
    // Either
        // body.new.to: Address to send to.
        // body.new.quant: Quantity (in ethers).
        // body.new.gasSettings (optional): Gas settings (gasPrice & gasLimit) for the tx.
    // Or
        // body.raw.tx: Raw tx in hex format.
    // Returns tx information.
    send(@Body() body: SendDto) {
        if (body.new && body.raw) throw new BadRequestException('Can\'t have both {"new", "raw"} in body')
        else if (body.new) {
            const { to, quant } = body.new;
            return this.transactionsService.send(to, quant, body.new.gasSettings);
        }
        else if (body.raw) {
            const { tx } = body.raw;
            return this.transactionsService.sendSigned(tx);
        }
        else throw new BadRequestException('Missing at least one of {"new", "raw"} in body');
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

    @Patch() // Update contract in DB from already deployed contract.
    // body.hash: Hash of the tx.
    // Returns tx information.
    updateTransaction(@Body() body: UpdateTransactionDto) {
        const { hash } = body;
        return this.transactionsService.updateTransaction(hash);
    }

    @Get('balance/:addr') // Get balance (in ethers) of an address.
    // addr: Wallet address.
    getBalance(@Param() queryParams: GetBalanceDto) {
        const { addr } = queryParams;
        return this.transactionsService.getBalance(addr);
    }

    @Post('sign') // Sign tx.
    // body.to: Address to send to.
    // body.quant: Quantity (in ethers).
    // body.gasSettings (optional): Gas settings (gasPrice & gasLimit) for the tx.
    // Returns raw tx in hex format.
    async sign(@Body() body: SendNewDto) {
        const { to, quant, gasSettings } = body;
        return { bytecode: await this.transactionsService.sign(to, quant, gasSettings) };
    }
}
