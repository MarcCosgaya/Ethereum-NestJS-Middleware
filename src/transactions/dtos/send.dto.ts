import { Type } from "class-transformer"
import { IsEthereumAddress, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "../../app/gas-settings.dto"

export class SendNewDto {
    @IsString()
    @IsEthereumAddress()
    to: string

    @Type(() => Number)
    @IsNumber()
    quant: number

    @IsOptional()
    @Type(() => GasSettingsDto)
    @ValidateNested()
    gasSettings: GasSettingsDto
}

export class SendRawDto {
    @IsString()
    tx: string
}

export class SendDto {
    @IsOptional()
    @Type(() => SendNewDto)
    @ValidateNested()
    new: SendNewDto

    @IsOptional()
    @Type(() => SendRawDto)
    @ValidateNested()
    raw: SendRawDto
}