import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsString } from "class-validator"

export class UpdateTransactionDto {
    @ApiProperty({
        description: 'Hash of the transaction.',
        example: '0xa83dc996c182595ee819868a83e0f5b39c3088f04051494dba9fa784f4430a01'
    })
    @IsString()
    @IsDefined()
    txHash: string
}