import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  // @IsEmail()
  // email: string;
  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل اسم مستخدم او بريد الكتروني' })
  usernameOrEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'من فضلك ادخل كلمة مرور صالحة' })
  @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
