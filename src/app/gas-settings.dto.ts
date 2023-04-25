import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional } from "class-validator"

export class GasSettingsDto {
    @ApiProperty({ type: BigInt })
    @IsInt()
    @Type(() => BigInt)
    @IsOptional()
    gasLimit?: BigInt

    @ApiProperty({ type: BigInt })
    @IsInt()
    @Type(() => BigInt)
    @IsOptional()
    gasPrice?: BigInt

    @ApiProperty({ type: BigInt })
    @IsInt()
    @Type(() => BigInt)
    @IsOptional()
    maxFeePerGas?: BigInt

    @ApiProperty({ type: BigInt })
    @IsInt()
    @Type(() => BigInt)
    @IsOptional()
    maxPriorityFeePerGas?: BigInt
}