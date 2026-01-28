import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { GenderEnum, IsAdult, IsMatched, IUser } from 'src/common';

export class signupDto implements Partial<IUser> {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  userName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(6)
  @IsMatched<string>(['password'], {
    message: 'password and confirmPassword mismatched',
  })
  confirmPassword: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  gender?: GenderEnum;

  @IsMongoId({ message: ' المجموعة غير صالحه' })
  @IsNotEmpty({ message: 'من فضلك قم بتحديد المجموعة قبل الاضافة' })
  userGroupId: Types.ObjectId;

}
