import { Controller, Get, Post, Param, Query, Body, Patch } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { DeployDto } from './dtos/deploy.dto';
import { GetOneDto } from './dtos/get-one.dto';
import { UpdateContractDto } from './dtos/update-contract.dto';
import { UpdateFunctionBodyDto, UpdateFunctionParamDto } from './dtos/update-function.dto';
import { ViewFunctionParamDto, ViewFunctionQueryDto } from './dtos/view-function.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { contract, transaction } from '@prisma/client';
import { PaginationDto } from 'src/app/pagination.dto';

@ApiTags('Contracts')
@Controller('contracts')
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) {}

    @ApiOperation({ summary: 'Call view function in smart contract.' })
    @Get(':id/call/:func')
    viewFunction(@Param() queryParams: ViewFunctionParamDto, @Query() params: ViewFunctionQueryDto): Promise<string> {
        const { id, func } = queryParams;
        const { args } = params;

        return this.contractsService.get(id, func, args);
    }

    @ApiOperation({ summary: 'Call update function in smart contract.' })
    @Post(':id/call')
    updateFunction(@Body() body: UpdateFunctionBodyDto, @Param() queryParams: UpdateFunctionParamDto): Promise<transaction> {
        const { id } = queryParams;
        const { func, args, gasSettings, quant, mnemonic } = body;
        const { mnemonic: mnem, password, path } = mnemonic || {};
        return this.contractsService.set(id, func, args, gasSettings, quant, mnem, password, path);
    }

    @ApiOperation({ summary: 'Deploy a precompiled smart contract.' })
    @Post()
    deploy(@Body() body: DeployDto): Promise<contract> {
        const { abi, bytecode, source, gasSettings, fileName, compilerVersion = 'latest', mnemonic } = body;
        const { mnemonic: mnem, password, path } = mnemonic || {};
        return this.contractsService.deploy(abi, bytecode, source, gasSettings, fileName, compilerVersion, mnem, password, path);
    }

    @ApiOperation({ summary: 'Verify and update contract in DB from already deployed contract.' })
    @Patch()
    updateContract(@Body() body: UpdateContractDto): Promise<contract> {
        const { tx, abi, source, fileName, compilerVersion = 'latest' } = body;
        return this.contractsService.updateContract(tx, abi, source, fileName, compilerVersion);
    }

    @ApiOperation({ summary: 'Get list of all stored smart contracts.' })
    @Get()
    getAll(@Query() params: PaginationDto): Promise<contract[]> {
        const { pageSize = 10, pageIndex = 0 } = params;
        return this.contractsService.getAll(pageSize, pageIndex);
    }

    @ApiOperation({ summary: 'Get a single smart contract.' })
    @Get(':id')
    getOne(@Param() queryParams: GetOneDto): Promise<contract> {
        return this.contractsService.getOne(queryParams.id);
    }
}
