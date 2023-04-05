import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "../../app/gas-settings.dto"

export class SendDto {
    @IsString()
    to: string

    @Type(() => Number)
    @IsNumber()
    quant: number

    @IsOptional()
    @Type(() => GasSettingsDto)
    @ValidateNested()
    gasSettings: GasSettingsDto
}