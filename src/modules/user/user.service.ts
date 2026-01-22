import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleRepository, UserGroupRepository, UserRepository } from 'src/db';
import { CreateUserDto } from './dto/create-user.dto';
import { Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareHash, generateHash } from 'src/utils';
import { ChangePasswordDto } from './dto/updatePassword.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userGroupRepository: UserGroupRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Validation Rule #1: Check if all data provided
    if (
      !createUserDto.fullName ||
      !createUserDto.userName ||
      !createUserDto.email ||
      !createUserDto.password ||
      !createUserDto.userGroupId
    ) {
      throw new BadRequestException('من فضلك ادخل كل البيانات المطلوبة');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      filter: { userName: createUserDto.userName },
    });

    if (existingUsername) {
      throw new ConflictException('اسم المستخدم موجود بالفعل');
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      filter: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('البريد الالكتروني موجود بالفعل');
    }

    // Validation Rule #2: Check if usergroup exists
    // const role = await this.roleRepository.findOne({
    //   filter: { _id: new Types.ObjectId(createUserDto.roleId) },
    // });

    // if (!role) {
    //   throw new BadRequestException(
    //     'من فضلك قم بتحديد صلاحيات المجموعة قبل الاضافة',
    //   );
    // }

    // Validation Rule #2: Check if usergroup exists
    const userGroupName = await this.userGroupRepository.findOne({
      filter: { _id: createUserDto.userGroupId },
    });

    if (!userGroupName) {
      throw new BadRequestException('من فضلك قم بتحديد المجموعة قبل الاضافة');
    }

    // Hash password
    //builtin hash function in the user model

    // Create user
    const user = await this.userRepository.create({
      data: [
        {
          fullName: createUserDto.fullName,
          userName: createUserDto.userName,
          email: createUserDto.email,
          password: createUserDto.password,
          // roleId: new Types.ObjectId(createUserDto.roleId) || null,
          userGroupId: new Types.ObjectId(createUserDto.userGroupId),
          isActive: true,
        },
      ],
    });

    return {
      message: 'تم إضافة المستخدم بنجاح',
      data: user,
    };
  }

  async findAll() {
    const users = await this.userRepository.find({
      filter: {},
      select: { password: 0 },
      options: {
        populate: [{ path: 'userGroupId', select: 'name' }],
      },
    });

    return {
      data: users,
      total: users.length,
    };
  }

  /**
   * Find One User - عرض مستخدم واحد
   */
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      filter: { _id: id },
      select: { password: 0 },
      options: {
        populate: [{ path: 'userGroupId', select: 'name' }],
      },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      data: user,
    };
  }

  /**
   * Update User - تعديل بيانات المستخدم
   * Validation Rule #8: Pop up for confirmation
   */
  // user.service.ts - update method (FIXED)

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      filter: { _id: id },
    });

    if (!existingUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Check if username is being changed and already exists
    if (
      updateUserDto.userName &&
      updateUserDto.userName !== existingUser.userName
    ) {
      const usernameExists = await this.userRepository.findOne({
        filter: {
          userName: updateUserDto.userName,
          _id: { $ne: id },
        },
      });

      if (usernameExists) {
        throw new ConflictException('اسم المستخدم موجود بالفعل');
      }
    }

    // Check if email is being changed and already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userRepository.findOne({
        filter: {
          email: updateUserDto.email,
          _id: { $ne: id },
        },
      });

      if (emailExists) {
        throw new ConflictException('البريد الالكتروني موجود بالفعل');
      }
    }

    // Check if group exists if being updated
    if (updateUserDto.userGroupId) {
      const userGroup = await this.userGroupRepository.findOne({
        filter: { _id: updateUserDto.userGroupId },
      });

      if (!userGroup) {
        throw new BadRequestException('المجموعة غير موجودة');
      }
    }

    // Prepare update data
    const updateData: any = { ...updateUserDto };

    // Convert userGroupId to ObjectId if provided
    if (updateUserDto.userGroupId) {
      updateData.userGroupId = new Types.ObjectId(updateUserDto.userGroupId);
    }

    // Update user
    const updatedUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updateData, // ✅ FIXED: كان { updateUserDto } غلط
    });

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    return {
      message: 'تم تعديل المستخدم بنجاح',
      data: userWithoutPassword,
    };
  }

  /**
   * Remove User - حذف مستخدم
   * Validation Rule #9: Pop up for confirmation
   */
  async remove(id: Types.ObjectId) {
    const user = await this.userRepository.deleteOne({ filter: { _id: id } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      message: 'تم حذف المستخدم بنجاح',
    };
  }

  /**
   * Toggle User Status - تفعيل/إلغاء تفعيل المستخدم
   */
  async toggleStatus(id: string) {
    const user = await this.userRepository.findOne({ filter: { _id: id } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const updatedUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: id },
      update: { isActive: !user.isActive },
    });

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      message: `تم ${updatedUser.isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`,
      data: {
        id: updatedUser._id,
        isActive: updatedUser.isActive,
      },
    };
  }

  /**
   * Change Password - تغيير كلمة المرور
   */
  async changePassword(
    userId: Types.ObjectId,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.userRepository.findOne({ filter: { _id: userId } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Verify old password
    if (!(await compareHash(changePasswordDto.oldPassword, user.password))) {
      throw new UnauthorizedException('كلمة المرور القديمة غير صحيحة');
    }

    // Hash new password
    const hashedPassword = await generateHash(changePasswordDto.newPassword);

    // Update password and changeCredentialTime
    await this.userRepository.findOneAndUpdate({
      filter: { _id: userId },
      update: { password: hashedPassword, changeCredentialTime: new Date() },
    });

    return {
      message: 'تم تغيير كلمة المرور بنجاح',
    };
  }

  /**
   * Search Users - البحث عن المستخدمين
   */
  async search(query: string) {
    const users = await this.userRepository.find({
      filter: {
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      },
    });

    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    return {
      data: usersWithoutPasswords,
      total: usersWithoutPasswords.length,
    };
  }

  /**
   * Get Users by Role - عرض المستخدمين حسب المجموعة
   */
  async getUsersByGroup(userGroupId: string) {
    const users = await this.userRepository.find({
      filter: { userGroupId },
      select: '-password',
      options: { populate: [{ path: 'userGroupId', select: 'name' }] },
    });

    return {
      data: users,
      total: users.length,
    };
  }
}
