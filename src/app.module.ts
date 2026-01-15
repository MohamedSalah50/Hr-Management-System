import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'node:path';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SharedAutnenticationModule } from './common/modules/autnentication.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RoleModule } from './modules/role/role.module';
import { CommonModule } from './common';
import { DepartmentModule } from './modules/department/department.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { SettingsModule } from './modules/settings/settings.module';
import { OfficialHolidaysModule } from './modules/official-holidays/official-holidays.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.dev'),
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      connectionFactory: (connection) => {
        console.log('✅ Connected to MongoDB :', connection.name);
        return connection;
      },
    }),

    SharedAutnenticationModule,
    AuthModule,
    UserModule,
    PermissionsModule,
    RoleModule,
    DepartmentModule,
    EmployeeModule,
    SettingsModule,
    OfficialHolidaysModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
