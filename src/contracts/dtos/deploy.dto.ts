import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDefined, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "src/app/gas-settings.dto"

export class DeployDto {
    @ApiProperty({
        description: 'JSON-formatted ABI of compiled smart contract.',
        example: '[{"constant":false,"inputs":[],"name":"pay","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]'
    })
    @IsString()
    @IsDefined()
    abi: string

    @ApiProperty({
        description: 'Hex-formatted bytecode of compiled smart contract.',
        example: '608060405234801561001057600080fd5b5060c48061001f6000396000f3fe60806040526004361060305760003560e01c80631b9265b81460355780636d4ce63c14603d578063b8e010de146065575b600080fd5b603b6079565b005b348015604857600080fd5b50604f607b565b6040518082815260200191505060405180910390f35b348015607057600080fd5b5060776084565b005b565b60008054905090565b61014d60008190555056fea265627a7a72315820a59b715eb5b0778305021a2de3f2c5529462c2827e1cb9ec510d498b1b7de71f64736f6c634300050e0032'
    })
    @IsString()
    @IsDefined()
    bytecode: string

    @ApiPropertyOptional({
        description: 'Minified source code of the smart contract.',
        example: 'pragma solidity ^0.5.0; contract SimpleStorage { uint x; function set() public { x = 333; } function get() public view returns (uint) { return x; } function pay() public payable {} }'
    })
    @IsString()
    @IsOptional()
    source?: string

    @ApiPropertyOptional({
        description: 'File name used to compile the contract.',
        example: 'contract-2c390734c4.sol'
    })
    @IsString()
    @IsOptional()
    fileName?: string

    @ApiPropertyOptional({
        description: 'Compiler version used to compile the contract.',
        example: '0.5.14',
        default: 'latest'
    })
    @IsString()
    @IsOptional()
    compilerVersion?: string

    @ApiPropertyOptional({
        description: 'Gas settings for the transaction.'
    })
    @ValidateNested()
    @Type(() => GasSettingsDto)
    @IsOptional()
    gasSettings?: GasSettingsDto
}