import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsString } from "class-validator"

export class GetOneDto {
    @ApiProperty({
        description: 'Hash of the transaction.',
        example: '0x9df7ba8ae253f458defb309e55c6f374c31c504f1e19f073a913ec8a87fa717d'
    })
    @IsString()
    @IsDefined()
    txHash: string
}