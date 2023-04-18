import { Type } from "class-transformer"
import { IsEthereumAddress, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "../../app/gas-settings.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class SendNewDto {
    @ApiProperty({ description: 'Address to send to.' })
    @IsString()
    @IsEthereumAddress()
    to: string

    @ApiProperty({ description: 'Quantity (in Ethers).' })
    @Type(() => Number)
    @IsNumber()
    quant: number

    @ApiPropertyOptional({ description: 'Gas settings for the transaction.' })
    @IsOptional()
    @Type(() => GasSettingsDto)
    @ValidateNested()
    gasSettings: GasSettingsDto
}

export class SendRawDto {
    @ApiProperty({ description: 'Raw transaction in hex format.' })
    @IsString()
    tx: string
}

export class SendDto {
    @ApiPropertyOptional({ description: 'Settings for a new transaction.' })
    @IsOptional()
    @Type(() => SendNewDto)
    @ValidateNested()
    new: SendNewDto

    @ApiPropertyOptional({ description: 'Settings for a raw transaction.' })
    @IsOptional()
    @Type(() => SendRawDto)
    @ValidateNested()
    raw: SendRawDto
}