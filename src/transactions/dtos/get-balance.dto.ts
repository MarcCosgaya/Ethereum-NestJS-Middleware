import { ApiProperty } from "@nestjs/swagger"
import { IsEthereumAddress, IsString } from "class-validator"

export class GetBalanceDto {
    @ApiProperty({ description: 'Wallet address.' })
    @IsString()
    @IsEthereumAddress()
    addr: string
}