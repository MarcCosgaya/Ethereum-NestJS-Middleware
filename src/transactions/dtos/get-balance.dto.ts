import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsEthereumAddress, IsString } from "class-validator"

export class GetBalanceDto {
    @ApiProperty({ description: 'Wallet address.' })
    @IsEthereumAddress()
    @IsString()
    @IsDefined()
    addr: string
}