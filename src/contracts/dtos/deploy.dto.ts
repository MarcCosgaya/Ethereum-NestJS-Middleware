import { IsString } from "class-validator"

export class DeployDto {
    @IsString()
    abi: string

    @IsString()
    bytecode: string

    @IsString()
    source: string
}