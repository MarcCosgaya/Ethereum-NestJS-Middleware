import { Type } from "class-transformer"
import { IsArray, IsInt, IsString } from "class-validator"

export class UpdateFunctionBodyDto {
    @IsString()
    func: string

    @IsArray()
    @IsString({ each: true })
    args: string[]
}

export class UpdateFunctionParamDto {
    @Type(() => Number)
    @IsInt()
    id: number
}