import { Controller, Get, Body, Post, Param, BadRequestException, Patch, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { SendDto, SendNewDto } from './dtos/send.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { GetOneDto } from './dtos/get-one.dto';
import { GetBalanceDto } from './dtos/get-balance.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { transaction } from '@prisma/client';
import { PaginationDto } from 'src/app/pagination.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @ApiOperation({ summary: 'Send Ethers to address.' })
    @Post()
    send(@Body() body: SendDto): Promise<transaction> {
        if (body.new && body.raw) throw new BadRequestException('Can\'t have both {"new", "raw"} in body')
        else if (body.new) {
            const { to, quant, mnemonic } = body.new;
            const { mnemonic: mnem, password, path } = mnemonic;
            return this.transactionsService.send(to, quant, body.new.gasSettings, mnem, password, path);
        }
        else if (body.raw) {
            const { tx } = body.raw;
            return this.transactionsService.sendSigned(tx);
        }
        else throw new BadRequestException('Missing at least one of {"new", "raw"} in body');
    }

    @ApiOperation({ summary: 'Get list of all stored transactions.' })
    @Get()
    getAll(@Query() params: PaginationDto): Promise<transaction[]> {
        const { pageSize = 10, pageIndex = 0 } = params;
        return this.transactionsService.getAll(pageSize, pageIndex);
    }

    @ApiOperation({ summary: 'Get a single transaction.' })
    @Get(':txHash')
    getOne(@Param() queryParams: GetOneDto): Promise<transaction> {
        const { txHash } = queryParams;
        return this.transactionsService.getOne(txHash)
    }

    @ApiOperation({ summary: 'Update transaction in DB from an already mined transaction.' })
    @Patch()
    updateTransaction(@Body() body: UpdateTransactionDto): Promise<transaction> {
        const { txHash } = body;
        return this.transactionsService.updateTransaction(txHash);
    }

    @ApiOperation({ summary: 'Get balance, in Ethers, of an address.' })
    @Get('balance/:addr')
    getBalance(@Param() queryParams: GetBalanceDto): Promise<string> {
        const { addr } = queryParams;
        return this.transactionsService.getBalance(addr);
    }

    @ApiOperation({ summary: 'Sign a transaction.' })
    @Post('sign')
    sign(@Body() body: SendNewDto): Promise<string> {
        const { to, quant, gasSettings, mnemonic } = body;
        const { mnemonic: mnem, password, path } = mnemonic;
        return this.transactionsService.sign(to, quant, gasSettings, mnem, password, path);
    }
}
