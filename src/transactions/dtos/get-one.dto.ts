import { IsString } from "class-validator"

export class GetOneDto {
    @IsString()
    txHash: string
}