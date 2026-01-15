import { IsNotEmpty, IsString, MinLength } from "class-validator"


export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل كلمة المرور القديمة' })
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل كلمة المرور الجديدة' })
    @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
    newPassword: string;
}