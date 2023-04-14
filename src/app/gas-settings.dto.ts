import { Type } from "class-transformer"
import { IsInt, IsOptional } from "class-validator"

export class GasSettingsDto {
    @Type(() => BigInt)
    @IsInt()
    gasLimit: BigInt

    @Type(() => BigInt)
    @IsInt()
    gasPrice: BigInt

    @Type(() => BigInt)
    @IsInt()
    maxFeePerGas: BigInt

    @Type(() => BigInt)
    @IsInt()
    maxPriorityFeePerGas: BigInt
}