import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsDefined, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "src/app/gas-settings.dto"

export class UpdateFunctionBodyDto {
    @ApiProperty({ description: 'Function name in smart contract.' })
    @IsString()
    @IsDefined()
    func: string

    @ApiProperty({ description: 'List of arguments of the function.' })
    @IsArray()
    @IsString({ each: true })
    @IsDefined()
    args: string[]

    @ApiPropertyOptional({ description: 'Gas settings for the transaction.' })
    @ValidateNested()
    @Type(() => GasSettingsDto)
    @IsOptional()
    gasSettings?: GasSettingsDto

    @ApiPropertyOptional({ description: 'Send Ethers if payable.' })
    @IsNumber()
    @IsOptional()
    quant?: number
}

export class UpdateFunctionParamDto {
    @ApiProperty({ description: 'Contract id.' })
    @IsInt()
    @Type(() => Number) // This is needed for @Param() and @Query().
    @IsDefined()
    id: number
}