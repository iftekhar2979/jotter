import { IsString } from "class-validator";

export class LockFileDto{
    @IsString()
    fileId:string;
}