import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDepartmentDto {
    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل اسم القسم' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}