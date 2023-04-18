import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class UpdateContractDto {
    @ApiProperty({ description: 'Hash of the transaction that deployed the contract.' })
    @IsString()
    tx: string

    @ApiProperty({ description: 'JSON-formatted ABI of compiled smart contract.' })
    @IsString()
    abi: string

    @ApiProperty({ description: 'Minified source code of the smart contract.' })
    @IsString()
    source: string

    @ApiProperty({ description: 'File name used to compile the contract.' })
    @IsString()
    fileName: string

    @ApiPropertyOptional({ description: 'Compiler version used to compile the contract. E.g. "0.5.14". Defaults to "latest".' })
    @IsOptional()
    @IsString()
    compilerVersion: string
}