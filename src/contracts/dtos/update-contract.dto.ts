import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsDefined, IsOptional, IsString } from "class-validator"

export class UpdateContractDto {
    @ApiProperty({
        description: 'Hash of the transaction that deployed the contract.',
        example: '0x0ce48a5a0779e86dcdfd546098de79e2ba4e46bca478461f6c6f9a9565c55d93'
    })
    @IsString()
    @IsDefined()
    tx: string

    @ApiProperty({
        description: 'JSON-formatted ABI of compiled smart contract.',
        example: '[{"constant":false,"inputs":[],"name":"pay","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]'
    })
    @IsString()
    @IsDefined()
    abi: string

    @ApiProperty({
        description: 'Minified source code of the smart contract.',
        example: 'pragma solidity ^0.5.0; contract SimpleStorage { uint x; function set() public { x = 333; } function get() public view returns (uint) { return x; } function pay() public payable {} }'
    })
    @IsString()
    @IsDefined()
    source: string

    @ApiProperty({
        description: 'File name used to compile the contract.',
        example: 'contract-2c390734c4.sol'
    })
    @IsString()
    @IsDefined()
    fileName: string

    @ApiPropertyOptional({
        description: 'Compiler version used to compile the contract.',
        example: '0.5.14',
        default: 'latest'
    })
    @IsString()
    @IsOptional()
    compilerVersion?: string
}