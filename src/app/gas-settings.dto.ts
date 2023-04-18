import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class GasSettingsDto {
    @ApiProperty({ type: BigInt })
    @Type(() => BigInt)
    @IsInt()
    gasLimit: BigInt

    @ApiProperty({ type: BigInt })
    @Type(() => BigInt)
    @IsInt()
    gasPrice: BigInt

    @ApiProperty({ type: BigInt })
    @Type(() => BigInt)
    @IsInt()
    maxFeePerGas: BigInt

    @ApiProperty({ type: BigInt })
    @Type(() => BigInt)
    @IsInt()
    maxPriorityFeePerGas: BigInt
}