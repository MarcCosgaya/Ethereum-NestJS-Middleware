import { Type } from "class-transformer"
import { IsDefined, IsEthereumAddress, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "../../app/gas-settings.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class SendNewDto {
    @ApiProperty({ description: 'Address to send to.' })
    @IsEthereumAddress()
    @IsString()
    @IsDefined()
    to: string

    @ApiProperty({ description: 'Quantity (in Ethers).' })
    @IsNumber()
    @IsDefined()
    quant: number

    @ApiPropertyOptional({ description: 'Gas settings for the transaction.' })
    @ValidateNested()
    @Type(() => GasSettingsDto)
    @IsOptional()
    gasSettings?: GasSettingsDto
}

export class SendRawDto {
    @ApiProperty({ description: 'Raw transaction in hex format.' })
    @IsString()
    @IsDefined()
    tx: string
}

export class SendDto {
    @ApiPropertyOptional({ description: 'Settings for a new transaction.' })
    @ValidateNested()
    @Type(() => SendNewDto)
    @IsOptional()
    new?: SendNewDto

    @ApiPropertyOptional({ description: 'Settings for a raw transaction.' })
    @ValidateNested()
    @Type(() => SendRawDto)
    @IsOptional()
    raw?: SendRawDto
}