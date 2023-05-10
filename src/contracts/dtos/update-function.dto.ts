import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsDefined, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "src/app/gas-settings.dto"
import { MnemonicDto } from "src/transactions/dtos/send.dto"

export class UpdateFunctionBodyDto {
    @ApiPropertyOptional({
        description: 'If provided, replaces internal private key.'
    })
    @ValidateNested()
    @Type(() => MnemonicDto)
    @IsOptional()
    mnemonic?: MnemonicDto
    
    @ApiProperty({
        description: 'Function name in smart contract.',
        example: 'get'
    })
    @IsString()
    @IsDefined()
    func: string

    @ApiProperty({
        description: 'List of arguments of the function.',
        example: ['a', 'b', 'c']
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    args?: string[]

    @ApiPropertyOptional({
        description: 'Gas settings for the transaction.'
    })
    @ValidateNested()
    @Type(() => GasSettingsDto)
    @IsOptional()
    gasSettings?: GasSettingsDto

    @ApiPropertyOptional({
        description: 'Send Ethers if payable.',
        example: 4.2
    })
    @IsNumber()
    @IsOptional()
    quant?: number
}

export class UpdateFunctionParamDto {
    @ApiProperty({
        description: 'Contract id.',
        example: 3
    })
    @IsInt()
    @Type(() => Number) // This is needed for @Param() and @Query().
    @IsDefined()
    id: number
}