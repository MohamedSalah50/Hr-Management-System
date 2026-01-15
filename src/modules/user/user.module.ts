import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleModel, RoleRepository } from 'src/db';

@Module({
  imports: [RoleModel],
  controllers: [UserController],
  providers: [UserService, RoleRepository],
})
export class UserModule { }
