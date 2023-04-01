import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class GetOneDto {
    @Type(() => Number)
    @IsInt()
    id: number
}