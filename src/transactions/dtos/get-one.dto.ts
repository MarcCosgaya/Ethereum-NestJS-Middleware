import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class GetOneDto {
    @ApiProperty({ description: 'Hash of the transaction.' })
    @IsString()
    txHash: string
}