import { Type } from "class-transformer"
import { IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "src/app/gas-settings.dto"

export class DeployDto {
    @IsString()
    abi: string

    @IsString()
    bytecode: string

    @IsString()
    source: string

    @IsOptional()
    @Type(() => GasSettingsDto)
    @ValidateNested()
    gasSettings: GasSettingsDto

    @IsString()
    fileName: string

    @IsOptional()
    @IsString()
    compilerVersion: string
}