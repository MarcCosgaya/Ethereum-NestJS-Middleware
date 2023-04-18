import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "src/app/gas-settings.dto"

export class DeployDto {
    @ApiProperty({ description: 'JSON-formatted ABI of compiled smart contract.' })
    @IsString()
    abi: string

    @ApiProperty({ description: 'Hex-formatted bytecode of compiled smart contract.' })
    @IsString()
    bytecode: string

    @ApiPropertyOptional({ description: 'Minified source code of the smart contract.' })
    @IsOptional()
    @IsString()
    source: string

    @ApiPropertyOptional({ description: 'File name used to compile the contract.' })
    @IsOptional()
    @IsString()
    fileName: string

    @ApiPropertyOptional({ description: 'Compiler version used to compile the contract. E.g. "0.5.14". Defaults to "latest".' })
    @IsOptional()
    @IsString()
    compilerVersion: string

    @ApiPropertyOptional({ description: 'Gas settings for the transaction.' })
    @IsOptional()
    @Type(() => GasSettingsDto)
    @ValidateNested()
    gasSettings: GasSettingsDto
}