import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenModel, TokenRepository, UserModel, UserRepository } from 'src/db';
import { PermissionsModule } from 'src/modules/permissions/permissions.module';
import { TokenService } from 'src/utils/security/token.security';

@Global()
@Module({
  imports: [UserModel, TokenModel,PermissionsModule],
  controllers: [],
  providers: [UserRepository, TokenService, JwtService, TokenRepository],
  exports: [UserRepository, TokenService, JwtService, TokenRepository, UserModel, TokenModel,PermissionsModule],
})
export class SharedAutnenticationModule {}
