import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserGroupModel, UserGroupRepository } from 'src/db';

@Module({
  imports: [UserGroupModel],
  controllers: [UserController],
  providers: [UserService, UserGroupRepository],
})
export class UserModule {}
