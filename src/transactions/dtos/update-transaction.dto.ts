import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsString } from "class-validator"

export class UpdateTransactionDto {
    @ApiProperty({ description: 'Hash of the transaction.' })
    @IsString()
    @IsDefined()
    txHash: string
}