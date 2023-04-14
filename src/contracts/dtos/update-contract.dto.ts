import { IsOptional, IsString } from "class-validator"

export class UpdateContractDto {
    @IsString()
    tx: string

    @IsString()
    abi: string

    @IsString()
    source: string

    @IsString()
    fileName: string

    @IsOptional()
    @IsString()
    compilerVersion: string
}