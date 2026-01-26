// src/common/guards/permissions/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';
import { UserGroupRepository } from 'src/db';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userGroupRepository: UserGroupRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. جيب الـ permission المطلوب من الـ decorator
    const requiredPermission = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // لو مفيش permission مطلوب، يبقى الـ endpoint متاح للكل (حسب الـ role)
    if (!requiredPermission) {
      return true;
    }

    // 2. جيب الـ user من الـ request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // 3. جيب الـ user groups اللي فيها الـ user ده
    const userGroups = await this.userGroupRepository.find({
      filter: {
        userIds: user.userId,
      },
      options: {
        populate: {
          path: 'permissions',
          select: 'resource action',
        },
      },
    });

    if (!userGroups || userGroups.length === 0) {
      throw new ForbiddenException('ليس لديك صلاحيات للوصول لهذا المورد');
    }

    // 4. تحقق من وجود الـ permission في أي من المجموعات
    const hasPermission = userGroups.some((group: any) => {
      const permissions = group.permissions || [];
      return permissions.some(
        (perm: any) =>
          perm.resource === requiredPermission.resource &&
          perm.action === requiredPermission.action,
      );
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية ${requiredPermission.action} على ${requiredPermission.resource}`,
      );
    }

    return true;
  }
}