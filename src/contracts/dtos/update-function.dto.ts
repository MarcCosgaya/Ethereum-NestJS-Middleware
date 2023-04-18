import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "src/app/gas-settings.dto"

export class UpdateFunctionBodyDto {
    @ApiProperty({ description: 'Function name in smart contract.' })
    @IsString()
    func: string

    @ApiProperty({ description: 'List of arguments of the function.' })
    @IsArray()
    @IsString({ each: true })
    args: string[]

    @ApiPropertyOptional({ description: 'Gas settings for the transaction.' })
    @IsOptional()
    @Type(() => GasSettingsDto)
    @ValidateNested()
    gasSettings: GasSettingsDto

    @ApiPropertyOptional({ description: 'Send Ethers if payable.' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    quant: number
}

export class UpdateFunctionParamDto {
    @ApiProperty({ description: 'Contract id.' })
    @Type(() => Number)
    @IsInt()
    id: number
}