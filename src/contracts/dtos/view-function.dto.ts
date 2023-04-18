import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsString } from "class-validator"

export class ViewFunctionDto {
    @ApiProperty({ description: 'Contract id.' })
    @Type(() => Number)
    @IsInt()
    id: number

    @ApiProperty({ description: 'Function name in smart contract.' })
    @IsString()
    func: string
}