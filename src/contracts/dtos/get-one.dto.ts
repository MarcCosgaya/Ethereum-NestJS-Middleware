import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDefined, IsInt } from "class-validator"

export class GetOneDto {
    @ApiProperty({ description: 'Contract id.' })
    @IsInt()
    @Type(() => Number) // This is needed for @Param() and @Query().
    @IsDefined()
    id: number
}