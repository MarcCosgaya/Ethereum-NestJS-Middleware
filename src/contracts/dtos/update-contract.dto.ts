import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsDefined, IsOptional, IsString } from "class-validator"

export class UpdateContractDto {
    @ApiProperty({ description: 'Hash of the transaction that deployed the contract.' })
    @IsString()
    @IsDefined()
    tx: string

    @ApiProperty({ description: 'JSON-formatted ABI of compiled smart contract.' })
    @IsString()
    @IsDefined()
    abi: string

    @ApiProperty({ description: 'Minified source code of the smart contract.' })
    @IsString()
    @IsDefined()
    source: string

    @ApiProperty({ description: 'File name used to compile the contract.' })
    @IsString()
    @IsDefined()
    fileName: string

    @ApiPropertyOptional({ description: 'Compiler version used to compile the contract. E.g. "0.5.14". Defaults to "latest".' })
    @IsString()
    @IsOptional()
    compilerVersion?: string
}