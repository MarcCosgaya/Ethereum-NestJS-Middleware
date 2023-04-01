import { Type } from "class-transformer"
import { IsInt, IsString } from "class-validator"

export class UpdateFunctionDto {
    @Type(() => Number)
    @IsInt()
    id: number

    @IsString()
    func: string
}