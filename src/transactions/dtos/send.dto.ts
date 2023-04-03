import { Type } from "class-transformer"
import { IsNumber, IsString } from "class-validator"

export class SendDto {
    @IsString()
    to: string

    @Type(() => Number)
    @IsNumber()
    quant: number
}