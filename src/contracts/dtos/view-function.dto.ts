import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsDefined, IsInt, IsOptional, IsString } from "class-validator"

export class ViewFunctionParamDto {
    @ApiProperty({
        description: 'Contract id.',
        example: 3
    })
    @IsInt()
    @Type(() => Number) // This is needed for @Param() and @Query().
    @IsDefined()
    id: number

    @ApiProperty({
        description: 'Function name in smart contract.',
        example: 'get'
    })
    @IsString()
    @IsDefined()
    func: string
}

export class ViewFunctionQueryDto {
    @ApiProperty({
        description: 'List of arguments of the function.',
        example: ['a', 'b', 'c']
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    args?: string[]
}