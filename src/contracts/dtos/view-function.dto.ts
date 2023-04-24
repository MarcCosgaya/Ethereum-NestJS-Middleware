import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsDefined, IsInt, IsString } from "class-validator"

export class ViewFunctionParamDto {
    @ApiProperty({ description: 'Contract id.' })
    @IsInt()
    @Type(() => Number)
    @IsDefined()
    id: number

    @ApiProperty({ description: 'Function name in smart contract.' })
    @IsString()
    @IsDefined()
    func: string
}

export class ViewFunctionQueryDto {
    @ApiProperty({ description: 'List of arguments of the function.' })
    @IsArray()
    @IsString({ each: true })
    @IsDefined()
    args: string[]
}