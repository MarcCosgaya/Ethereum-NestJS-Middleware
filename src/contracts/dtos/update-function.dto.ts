import { Type } from "class-transformer"
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "src/app/gas-settings.dto"

export class UpdateFunctionBodyDto {
    @IsString()
    func: string

    @IsArray()
    @IsString({ each: true })
    args: string[]

    @IsOptional()
    @Type(() => GasSettingsDto)
    @ValidateNested()
    gasSettings: GasSettingsDto
}

export class UpdateFunctionParamDto {
    @Type(() => Number)
    @IsInt()
    id: number
}