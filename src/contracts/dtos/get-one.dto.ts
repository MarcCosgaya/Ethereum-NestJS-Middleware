import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class GetOneDto {
    @ApiProperty({ description: 'Contract id.' })
    @Type(() => Number)
    @IsInt()
    id: number
}