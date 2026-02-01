// src/common/helpers/permission-checker.helper.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserRepository } from 'src/db';

@Injectable()
export class PermissionCheckerHelper {
    constructor(private readonly userRepository: UserRepository) { }

    /**
     * Check if user has permission
     * @param userId - معرف المستخدم
     * @param resource - اسم الـ resource (مثال: 'employees')
     * @param action - نوع العملية (مثال: 'create', 'read', 'update', 'delete')
     * @throws ForbiddenException - إذا لم يكن لديه صلاحية
     */
    async checkPermission(
        userId: string,
        resource: string,
        action: string,
    ): Promise<void> {
        const user = await this.userRepository.findOne({
            filter: { _id: new Types.ObjectId(userId) },
            options: {
                populate: {
                    path: 'userGroupId',
                    select: 'name permissions',
                    populate: {
                        path: 'permissions',
                        select: 'resource action name',
                    },
                },
            },
        });

        if (!user) {
            throw new ForbiddenException('المستخدم غير موجود');
        }

        const userGroup = user.userGroupId as any;

        if (!userGroup) {
            throw new ForbiddenException(
                'ليس لديك مجموعة صلاحيات. يرجى التواصل مع المسؤول',
            );
        }

        const permissions = userGroup.permissions || [];

        const hasPermission = permissions.some(
            (perm: any) =>
                perm.resource === resource && perm.action === action,
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                `ليس لديك صلاحية ${this.getActionLabel(action)} على ${this.getResourceLabel(resource)}`,
            );
        }
    }

    /**
     * Check if user has ANY of the permissions
     * @param userId - معرف المستخدم
     * @param permissions - مصفوفة من الصلاحيات المطلوبة
     * @throws ForbiddenException - إذا لم يكن لديه أي صلاحية
     */
    async checkAnyPermission(
        userId: string,
        requiredPermissions: Array<{ resource: string; action: string }>,
    ): Promise<void> {
        const user = await this.userRepository.findOne({
            filter: { _id: new Types.ObjectId(userId) },
            options: {
                populate: {
                    path: 'userGroupId',
                    select: 'permissions',
                    populate: {
                        path: 'permissions',
                        select: 'resource action',
                    },
                },
            },
        });

        if (!user || !user.userGroupId) {
            throw new ForbiddenException(
                'ليس لديك صلاحيات للوصول إلى هذا المورد',
            );
        }

        const userGroup = user.userGroupId as any;
        const permissions = userGroup.permissions || [];

        const hasPermission = requiredPermissions.some((requiredPerm) =>
            permissions.some(
                (perm: any) =>
                    perm.resource === requiredPerm.resource &&
                    perm.action === requiredPerm.action,
            ),
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                'ليس لديك الصلاحيات الكافية لهذا الإجراء',
            );
        }
    }

    /**
     * Check if user has ALL of the permissions
     * @param userId - معرف المستخدم
     * @param permissions - مصفوفة من الصلاحيات المطلوبة (كلها لازم تكون موجودة)
     * @throws ForbiddenException - إذا لم يكن لديه كل الصلاحيات
     */
    async checkAllPermissions(
        userId: string,
        requiredPermissions: Array<{ resource: string; action: string }>,
    ): Promise<void> {
        const user = await this.userRepository.findOne({
            filter: { _id: new Types.ObjectId(userId) },
            options: {
                populate: {
                    path: 'userGroupId',
                    select: 'permissions',
                    populate: {
                        path: 'permissions',
                        select: 'resource action',
                    },
                },
            },
        });

        if (!user || !user.userGroupId) {
            throw new ForbiddenException(
                'ليس لديك صلاحيات للوصول إلى هذا المورد',
            );
        }

        const userGroup = user.userGroupId as any;
        const permissions = userGroup.permissions || [];

        // تحقق إن كل الصلاحيات المطلوبة موجودة
        const hasAllPermissions = requiredPermissions.every((requiredPerm) =>
            permissions.some(
                (perm: any) =>
                    perm.resource === requiredPerm.resource &&
                    perm.action === requiredPerm.action,
            ),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException(
                'ليس لديك كل الصلاحيات المطلوبة لهذا الإجراء',
            );
        }
    }

    /**
     * Get user permissions (for info purposes)
     * @param userId - معرف المستخدم
     * @returns Array of permissions
     */
    async getUserPermissions(userId: string) {
        const user = await this.userRepository.findOne({
            filter: { _id: new Types.ObjectId(userId) },
            options: {
                populate: {
                    path: 'userGroupId',
                    select: 'name permissions',
                    populate: {
                        path: 'permissions',
                        select: 'resource action name description',
                    },
                },
            },
        });

        if (!user || !user.userGroupId) {
            return [];
        }

        const userGroup = user.userGroupId as any;
        return userGroup.permissions || [];
    }

    /**
     * Get user group info
     * @param userId - معرف المستخدم
     * @returns User group info
     */
    async getUserGroup(userId: string) {
        const user = await this.userRepository.findOne({
            filter: { _id: new Types.ObjectId(userId) },
            options: {
                populate: {
                    path: 'userGroupId',
                    select: 'name description permissions',
                },
            },
        });

        if (!user || !user.userGroupId) {
            return null;
        }

        return user.userGroupId;
    }

    // ✅ Helper methods للترجمة
    private getActionLabel(action: string): string {
        const labels: Record<string, string> = {
            create: 'إضافة',
            read: 'عرض',
            update: 'تعديل',
            delete: 'حذف',
        };
        return labels[action] || action;
    }

    private getResourceLabel(resource: string): string {
        const labels: Record<string, string> = {
            employees: 'الموظفين',
            departments: 'الأقسام',
            attendance: 'الحضور والانصراف',
            'salary-reports': 'تقارير الرواتب',
            settings: 'الإعدادات',
            users: 'المستخدمين',
            'user-groups': 'مجموعات المستخدمين',
            permissions: 'الصلاحيات',
            'official-holidays': 'الإجازات الرسمية',
        };
        return labels[resource] || resource;
    }
}