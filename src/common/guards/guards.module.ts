// src/common/guards/guards.module.ts
import { Module, Global } from '@nestjs/common';
import { PermissionsGuard } from './permmission/permissions.guard';
import { UserGroupModule } from 'src/modules/user-group/user-group.module';


@Global() 
@Module({
  imports: [UserGroupModule], 
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class GuardsModule {}