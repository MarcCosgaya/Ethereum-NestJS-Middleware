import { IsString, IsNotEmpty } from "class-validator";

export class UpdateDto {
    @IsString()
    @IsNotEmpty()
    pkey: string;
}