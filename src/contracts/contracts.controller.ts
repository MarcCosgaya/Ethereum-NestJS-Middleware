import { Controller, Get, Post, Param, Query, Put, Body } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { DeployDto } from './dtos/deploy.dto';
import { GetOneDto } from './dtos/get-one.dto';
import { UpdateContractDto } from './dtos/update-contract.dto';
import { UpdateFunctionBodyDto, UpdateFunctionParamDto } from './dtos/update-function.dto';
import { ViewFunctionDto } from './dtos/view-function.dto';

@Controller('contracts')
export class ContractsController {
    constructor(private contractsService: ContractsService) {}

    @Get(':id/call/:func') // Call view function in smart contract.
    // id: ID of smart contract.
    // func: Function name in smart contract.
    // Returns requested value.
    viewFunction(@Param() queryParams: ViewFunctionDto, @Query() params: any) {
        const { id, func } = queryParams;
        const { args } = params;
        return this.contractsService.get(id, func, args);
    }

    @Post(':id/call') // Call update function in smart contract.
    // id: ID of smart contract.
    // body.func: Function name in smart contract.
    // body.args: List of arguments of the function.
    // body.gasSettings (optional): Gas settings (gasPrice & gasLimit) for the tx.
    // body.quant (optional): Send ethers if payable.
    // Returns tx information.
    updateFunction(@Body() body: UpdateFunctionBodyDto, @Param() queryParams: UpdateFunctionParamDto) {
        const { id } = queryParams;
        const { func, args, gasSettings, quant } = body;
        return this.contractsService.set(id, func, args, gasSettings, quant);
    }

    @Post() // Deploy a precompiled smart contract.
    // body.abi: JSON-formatted ABI of compiled smart contract.
    // body.bytecode: hex-formatted bytecode of compiled smart contract.
    // body.source: Minified source code of the smart contract.
    // body.gasSettings (optional): Gas settings (gasPrice & gasLimit) for the tx.
    // body.fileName: File name used to compile the contract.
    // body.compilerVersion: Compiler version used to compile the contract. E.g. "0.5.14". Defaults to "latest".
    // Returns contract information.
    deploy(@Body() body: DeployDto) {
        const { abi, bytecode, source, gasSettings } = body;
        return this.contractsService.deploy(abi, bytecode, source, gasSettings);
    }

    @Put() // Verify and update contract in DB from already deployed contract.
    // body.tx: Hash of the transaction that deployed the contract.
    // body.abi: JSON-formatted ABI of compiled smart contract.
    // body.source: Minified source code of the smart contract.
    // body.fileName: File name used to compile the contract.
    // body.compilerVersion: Compiler version used to compile the contract. E.g. "0.5.14". Defaults to "latest".
    // Returns contract information.
    updateContract(@Body() body: UpdateContractDto) {
        const { tx, abi, source, fileName, compilerVersion = 'latest' } = body;
        return this.contractsService.updateContract(tx, abi, source, fileName, compilerVersion);
    }

    @Get() // Get list of all cached smart contracts.
    // Returns list of contracts.
    getAll() {
        return this.contractsService.getAll();
    }

    @Get(':id') // Get a single contract.
    // id: ID of smart contract.
    // Returns a single contract.
    getOne(@Param() queryParams: GetOneDto) {
        return this.contractsService.getOne(queryParams.id);
    }
}
