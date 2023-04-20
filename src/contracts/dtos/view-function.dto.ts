import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsInt, IsString } from "class-validator"

export class ViewFunctionParamDto {
    @ApiProperty({ description: 'Contract id.' })
    @Type(() => Number)
    @IsInt()
    id: number

    @ApiProperty({ description: 'Function name in smart contract.' })
    @IsString()
    func: string
}

export class ViewFunctionQueryDto {
    @ApiProperty({ description: 'List of arguments of the function.' })
    @IsArray()
    @IsString({ each: true })
    args: string[]
}