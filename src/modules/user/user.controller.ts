import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { type IAuthRequest, RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Types } from 'mongoose';
import { ChangePasswordDto } from './dto/updatePassword.dto';
import { CreateUserDto } from './dto/create-user.dto';

@auth([RoleEnum.admin, RoleEnum.superAdmin])
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * GET /users - عرض كل المستخدمين
   * GET /users?search=ahmed - البحث عن مستخدمين
   * GET /users?roleId=xxx - عرض مستخدمين بمجموعة معينة
   */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('userGroupId') userGroupId?: string,
  ) {
    if (search) {
      return this.userService.search(search);
    }
    if (userGroupId) {
      return this.userService.getUsersByGroup(userGroupId);
    }
    return this.userService.findAll();
  }

  /**
   * GET /users/:id - عرض مستخدم واحد
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * PATCH /users/:id - تعديل بيانات المستخدم
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id - حذف مستخدم
   */
  @Delete(':id')
  remove(@Param('id') id: Types.ObjectId) {
    return this.userService.remove(id);
  }

  /**
   * PATCH /users/:id/toggle-status - تفعيل/إلغاء تفعيل المستخدم
   */
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.userService.toggleStatus(id);
  }

  /**
   * POST /users/change-password - تغيير كلمة المرور
   */
  @Post('change-password')
  changePassword(
    @Req() req: IAuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user._id, changePasswordDto);
  }
}
