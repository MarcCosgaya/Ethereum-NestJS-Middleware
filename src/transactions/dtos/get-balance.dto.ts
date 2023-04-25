import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsEthereumAddress, IsString } from "class-validator"

export class GetBalanceDto {
    @ApiProperty({
        description: 'Wallet address.',
        example: '0xA46B8f9D99446AF2E0d536B4A89C17Cb62A6ad8A'
    })
    @IsEthereumAddress()
    @IsString()
    @IsDefined()
    addr: string
}