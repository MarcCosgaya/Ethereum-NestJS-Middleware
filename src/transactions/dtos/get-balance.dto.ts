import { IsEthereumAddress, IsString } from "class-validator"

export class GetBalanceDto {
    @IsString()
    @IsEthereumAddress()
    addr: string
}