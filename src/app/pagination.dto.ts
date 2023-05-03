import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsInt } from "class-validator"

export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Number of elements per page.',
        example: 30,
        default: 10
    })
    @IsInt()
    @Type(() => Number) // This is needed for @Param() and @Query().
    @IsOptional()
    pageSize: number

    @ApiPropertyOptional({
        description: 'Index of the page.',
        example: 3,
        default: 0
    })
    @IsInt()
    @Type(() => Number) // This is needed for @Param() and @Query().
    @IsOptional()
    pageIndex: number
}