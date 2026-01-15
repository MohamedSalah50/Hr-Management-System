import { IsEmail, IsMongoId, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Types } from "mongoose";
import { IUser } from "src/common";

export class CreateUserDto implements Partial<IUser> {
    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل الاسم بالكامل' })
    fullName: string;

    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل اسم المستخدم' })
    @MinLength(3, { message: 'اسم المستخدم يجب ألا يقل عن 3 أحرف' })
    userName: string;

    @IsEmail({}, { message: 'من فضلك ادخل بريد الكتروني صالح' })
    @IsNotEmpty({ message: 'من فضلك ادخل البريد الالكتروني' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل كلمة المرور' })
    @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
    password: string;

    @IsMongoId({ message: 'معرف المجموعة غير صالح' })
    @IsNotEmpty({ message: 'من فضلك قم بتحديد صلاحيات المجموعة قبل الاضافة' })
    roleId: Types.ObjectId;
}




export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل كلمة المرور القديمة' })
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'من فضلك ادخل كلمة المرور الجديدة' })
    @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
    newPassword: string;
}
