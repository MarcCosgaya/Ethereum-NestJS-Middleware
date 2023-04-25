import { Type } from "class-transformer"
import { IsDefined, IsEthereumAddress, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { GasSettingsDto } from "../../app/gas-settings.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class SendNewDto {
    @ApiProperty({
        description: 'Address to send to.',
        example: '0x1b973BC2cb3e4413a6B3E302357Fe9d1D586028e'
    })
    @IsEthereumAddress()
    @IsString()
    @IsDefined()
    to: string

    @ApiProperty({
        description: 'Quantity (in Ethers).',
        example: 4.3
    })
    @IsNumber()
    @IsDefined()
    quant: number

    @ApiPropertyOptional({
        description: 'Gas settings for the transaction.'
    })
    @ValidateNested()
    @Type(() => GasSettingsDto)
    @IsOptional()
    gasSettings?: GasSettingsDto
}

export class SendRawDto {
    @ApiProperty({
        description: 'Raw transaction in hex format.',
        example: '0x02f87482053914843b9aca0084443bdd24825208941b973bc2cb3e4413a6b3e302357fe9d1d586028e883782dace9d90000080c001a02541d4e71162e152def63edb54e8c53a58cde7971af36f1382af8a7489060043a073e94bf43763a48c2e9bd4cb5597d378775c9f75d3d8f4b39ccf3aaaaeee17ab'
    })
    @IsString()
    @IsDefined()
    tx: string
}

export class SendDto {
    @ApiPropertyOptional({
        description: 'Settings for a new transaction.'
    })
    @ValidateNested()
    @Type(() => SendNewDto)
    @IsOptional()
    new?: SendNewDto

    @ApiPropertyOptional({
        description: 'Settings for a raw transaction.'
    })
    @ValidateNested()
    @Type(() => SendRawDto)
    @IsOptional()
    raw?: SendRawDto
}