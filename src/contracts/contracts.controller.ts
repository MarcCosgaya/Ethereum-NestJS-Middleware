import { Controller, Get, Post, Param, Query, Body, Patch } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { DeployDto } from './dtos/deploy.dto';
import { GetOneDto } from './dtos/get-one.dto';
import { UpdateContractDto } from './dtos/update-contract.dto';
import { UpdateFunctionBodyDto, UpdateFunctionParamDto } from './dtos/update-function.dto';
import { ViewFunctionParamDto, ViewFunctionQueryDto } from './dtos/view-function.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { contract, transaction } from '@prisma/client';

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
        const { func, args, gasSettings, quant } = body;
        return this.contractsService.set(id, func, args, gasSettings, quant);
    }

    @ApiOperation({ summary: 'Deploy a precompiled smart contract.' })
    @Post()
    deploy(@Body() body: DeployDto): Promise<contract> {
        const { abi, bytecode, source, gasSettings, fileName, compilerVersion } = body;
        return this.contractsService.deploy(abi, bytecode, source, gasSettings, fileName, compilerVersion);
    }

    @ApiOperation({ summary: 'Verify and update contract in DB from already deployed contract.' })
    @Patch()
    updateContract(@Body() body: UpdateContractDto): Promise<contract> {
        const { tx, abi, source, fileName, compilerVersion = 'latest' } = body;
        return this.contractsService.updateContract(tx, abi, source, fileName, compilerVersion);
    }

    @ApiOperation({ summary: 'Get list of all stored smart contracts.' })
    @Get()
    getAll(): Promise<contract[]> {
        return this.contractsService.getAll();
    }

    @ApiOperation({ summary: 'Get a single smart contract.' })
    @Get(':id')
    getOne(@Param() queryParams: GetOneDto): Promise<contract> {
        return this.contractsService.getOne(queryParams.id);
    }
}
