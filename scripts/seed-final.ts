// scripts/seed-final.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import {
  PermissionRepository,
  RoleRepository,
  UserRepository,
  DepartmentRepository,
  EmployeeRepository,
  SettingRepository,
  OfficialHolidayRepository,
  AttendanceRepository,
} from '../src/db';
import {
  GenderEnum,
  SettingsEnum,
  AttendanceEnum,
  RoleEnum,
} from '../src/common';
import { Types } from 'mongoose';

// Helper function
const getRandomTime = (baseHour: number, variation: number = 30): string => {
  const minuteVariation = Math.floor(Math.random() * variation) - variation / 2;
  const totalMinutes = baseHour * 60 + minuteVariation;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${Math.abs(minutes).toString().padStart(2, '0')}`;
};

// Define attendance data type
interface AttendanceData {
  employeeId: Types.ObjectId;
  date: Date;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceEnum;
  overtimeHours: number;
  lateHours: number;
  notes: string;
}

async function seedFinal() {
  console.log(
    '\n╔═══════════════════════════════════════════════════════════╗',
  );
  console.log('║       🌱  HR SYSTEM - COMPLETE DATABASE SEED  🌱           ║');
  console.log(
    '╚═══════════════════════════════════════════════════════════╝\n',
  );

  const startTime = Date.now();
  const app = await NestFactory.createApplicationContext(AppModule);

  const permissionRepo = app.get(PermissionRepository);
  const roleRepo = app.get(RoleRepository);
  const userRepo = app.get(UserRepository);
  const departmentRepo = app.get(DepartmentRepository);
  const employeeRepo = app.get(EmployeeRepository);
  const settingRepo = app.get(SettingRepository);
  const holidayRepo = app.get(OfficialHolidayRepository);
  const attendanceRepo = app.get(AttendanceRepository);

  try {
    // Clean
    console.log('🧹 Cleaning existing data...');
    await Promise.all([
      attendanceRepo.deleteMany({ filter: {} }),
      employeeRepo.deleteMany({ filter: {} }),
      holidayRepo.deleteMany({ filter: {} }),
      settingRepo.deleteMany({ filter: {} }),
      departmentRepo.deleteMany({ filter: {} }),
      userRepo.deleteMany({ filter: {} }),
      roleRepo.deleteMany({ filter: {} }),
      permissionRepo.deleteMany({ filter: {} }),
    ]);
    console.log('✅ Cleaned\n');

    // 1. Permissions
    console.log('📋 [1/8] Creating permissions...');
    const permissions = await permissionRepo.create({
      data: [
        {
          name: 'create_employee',
          resource: 'employees',
          action: 'create',
          description: 'صلاحية إضافة موظف جديد للنظام',
        },
        {
          name: 'read_employee',
          resource: 'employees',
          action: 'read',
          description: 'صلاحية عرض بيانات الموظفين',
        },
        {
          name: 'update_employee',
          resource: 'employees',
          action: 'update',
          description: 'صلاحية تعديل بيانات الموظف',
        },
        {
          name: 'delete_employee',
          resource: 'employees',
          action: 'delete',
          description: 'صلاحية حذف موظف من النظام',
        },
        {
          name: 'create_attendance',
          resource: 'attendance',
          action: 'create',
          description: 'صلاحية إضافة سجل حضور جديد',
        },
        {
          name: 'read_attendance',
          resource: 'attendance',
          action: 'read',
          description: 'صلاحية عرض سجلات الحضور',
        },
        {
          name: 'update_attendance',
          resource: 'attendance',
          action: 'update',
          description: 'صلاحية تعديل سجل الحضور',
        },
        {
          name: 'delete_attendance',
          resource: 'attendance',
          action: 'delete',
          description: 'صلاحية حذف سجل الحضور',
        },
        {
          name: 'create_department',
          resource: 'departments',
          action: 'create',
          description: 'صلاحية إضافة قسم جديد',
        },
        {
          name: 'read_department',
          resource: 'departments',
          action: 'read',
          description: 'صلاحية عرض الأقسام المتاحة',
        },
        {
          name: 'update_department',
          resource: 'departments',
          action: 'update',
          description: 'صلاحية تعديل بيانات القسم',
        },
        {
          name: 'delete_department',
          resource: 'departments',
          action: 'delete',
          description: 'صلاحية حذف قسم من النظام',
        },
        {
          name: 'generate_salary_report',
          resource: 'salary_reports',
          action: 'create',
          description: 'صلاحية إنشاء تقرير الرواتب',
        },
        {
          name: 'read_salary_report',
          resource: 'salary_reports',
          action: 'read',
          description: 'صلاحية عرض تقارير الرواتب',
        },
        {
          name: 'delete_salary_report',
          resource: 'salary_reports',
          action: 'delete',
          description: 'صلاحية حذف تقرير الراتب',
        },
        {
          name: 'manage_settings',
          resource: 'settings',
          action: 'manage',
          description: 'صلاحية إدارة إعدادات النظام',
        },
        {
          name: 'read_settings',
          resource: 'settings',
          action: 'read',
          description: 'صلاحية عرض إعدادات النظام',
        },
        {
          name: 'create_holiday',
          resource: 'holidays',
          action: 'create',
          description: 'صلاحية إضافة إجازة رسمية',
        },
        {
          name: 'read_holiday',
          resource: 'holidays',
          action: 'read',
          description: 'صلاحية عرض الإجازات الرسمية',
        },
        {
          name: 'update_holiday',
          resource: 'holidays',
          action: 'update',
          description: 'صلاحية تعديل بيانات الإجازة',
        },
        {
          name: 'delete_holiday',
          resource: 'holidays',
          action: 'delete',
          description: 'صلاحية حذف إجازة رسمية',
        },
        {
          name: 'create_user',
          resource: 'users',
          action: 'create',
          description: 'صلاحية إضافة مستخدم جديد',
        },
        {
          name: 'read_user',
          resource: 'users',
          action: 'read',
          description: 'صلاحية عرض بيانات المستخدمين',
        },
        {
          name: 'update_user',
          resource: 'users',
          action: 'update',
          description: 'صلاحية تعديل بيانات المستخدم',
        },
        {
          name: 'delete_user',
          resource: 'users',
          action: 'delete',
          description: 'صلاحية حذف مستخدم من النظام',
        },
        {
          name: 'create_role',
          resource: 'roles',
          action: 'create',
          description: 'صلاحية إضافة مجموعة صلاحيات',
        },
        {
          name: 'read_role',
          resource: 'roles',
          action: 'read',
          description: 'صلاحية عرض مجموعات الصلاحيات',
        },
        {
          name: 'update_role',
          resource: 'roles',
          action: 'update',
          description: 'صلاحية تعديل مجموعة الصلاحيات',
        },
        {
          name: 'delete_role',
          resource: 'roles',
          action: 'delete',
          description: 'صلاحية حذف مجموعة الصلاحيات',
        },
        {
          name: 'create_permission',
          resource: 'permissions',
          action: 'create',
          description: 'صلاحية إضافة صلاحية جديدة',
        },
        {
          name: 'read_permission',
          resource: 'permissions',
          action: 'read',
          description: 'صلاحية عرض الصلاحيات المتاحة',
        },
        {
          name: 'update_permission',
          resource: 'permissions',
          action: 'update',
          description: 'صلاحية تعديل بيانات الصلاحية',
        },
        {
          name: 'delete_permission',
          resource: 'permissions',
          action: 'delete',
          description: 'صلاحية حذف صلاحية من النظام',
        },
      ],
    });
    console.log(`✅ ${permissions.length} permissions\n`);
    // 2. Roles
    console.log('👥 [2/8] Creating roles...');
    const allPermIds = permissions.map((p: any) => p._id);
    const [adminRole] = await roleRepo.create({
      data: [
        {
          name: 'مدير النظام',
          description: 'صلاحيات كاملة للوصول والتحكم بالنظام',
          permissions: allPermIds,
        },
      ],
    });
    const hrPerms = permissions
      .filter((p: any) =>
        [
          'employees',
          'attendance',
          'departments',
          'salary_reports',
          'holidays',
        ].includes(p.resource),
      )
      .map((p: any) => p._id);
    const [hrRole] = await roleRepo.create({
      data: [
        {
          name: 'مدير الموارد البشرية',
          description: 'إدارة الموظفين والحضور والإجازات',
          permissions: hrPerms,
        },
      ],
    });
    const accPerms = permissions
      .filter(
        (p: any) =>
          ['salary_reports', 'settings', 'employees'].includes(p.resource) &&
          ['read', 'create', 'manage'].includes(p.action),
      )
      .map((p: any) => p._id);
    const [accRole] = await roleRepo.create({
      data: [
        {
          name: 'محاسب',
          description: 'إدارة الرواتب والتقارير المالية',
          permissions: accPerms,
        },
      ],
    });
    const readPerms = permissions
      .filter((p: any) => p.action === 'read')
      .map((p: any) => p._id);
    const [viewRole] = await roleRepo.create({
      data: [
        {
          name: 'مشاهد',
          description: 'عرض البيانات فقط بدون تعديل',
          permissions: readPerms,
        },
      ],
    });
    console.log('✅ 4 roles\n');

    // 3. Users - ✅ FIX: Use RoleEnum instead of string literals
    console.log('👤 [3/8] Creating users...');
    await userRepo.create({
      data: [
        {
          fullName: 'أحمد محمد الإداري',
          userName: 'admin01', // Changed from 'admin' (5 chars) to 'admin01' (7 chars)
          email: 'admin@company.com',
          password: 'Admin@123',
          roleId: adminRole._id,
          role: RoleEnum.admin,
          isActive: true,
        },
        {
          fullName: 'فاطمة حسن المدير',
          userName: 'hrmanager', // Changed from 'hr_manager' is already 10 chars, but let's keep it consistent
          email: 'hr@company.com',
          password: 'Hr@123456',
          roleId: hrRole._id,
          role: RoleEnum.admin,
          isActive: true,
        },
        {
          fullName: 'خالد عبدالله المحاسب',
          userName: 'accountant', // Already 10 chars - OK
          email: 'accountant@company.com',
          password: 'Account@123',
          roleId: accRole._id,
          role: RoleEnum.admin,
          isActive: true,
        },
        {
          fullName: 'سارة أحمد المشاهد',
          userName: 'viewer01', // Changed from 'viewer' (6 chars) to 'viewer01' (8 chars)
          email: 'viewer@company.com',
          password: 'Viewer@123',
          roleId: viewRole._id,
          role: RoleEnum.user,
          isActive: true,
        },
      ],
    });
    console.log('✅ 4 users\n');

    // 4. Settings
    console.log('⚙️  [4/8] Creating settings...');
    await settingRepo.create({
      data: [
        {
          key: 'overtime_rate_per_hour',
          value: 50,
          dataType: SettingsEnum.Number,
          description: 'معدل الإضافة',
        },
        {
          key: 'deduction_rate_per_hour',
          value: 30,
          dataType: SettingsEnum.Number,
          description: 'معدل الخصم',
        },
        {
          key: 'weekend_days',
          value: ['Friday', 'Saturday'],
          dataType: SettingsEnum.Array,
          description: 'أيام الإجازة',
        },
        {
          key: 'working_hours_per_day',
          value: 8,
          dataType: SettingsEnum.Number,
          description: 'ساعات العمل',
        },
        {
          key: 'company_name',
          value: 'شركة التقنية المتقدمة',
          dataType: SettingsEnum.String,
          description: 'اسم الشركة',
        },
        {
          key: 'late_tolerance_minutes',
          value: 15,
          dataType: SettingsEnum.Number,
          description: 'التأخير المسموح',
        },
      ],
    });
    console.log('✅ 6 settings\n');

    // 5. Departments
    console.log('🏢 [5/8] Creating departments...');
    const depts = await departmentRepo.create({
      data: [
        { name: 'الموارد البشرية', description: 'إدارة شؤون الموظفين' },
        { name: 'تكنولوجيا المعلومات', description: 'تطوير وصيانة الأنظمة' },
        { name: 'المحاسبة والمالية', description: 'إدارة الحسابات' },
        {
          name: 'المبيعات والتسويق',
          description: 'تطوير استراتيجيات المبيعات',
        },
        { name: 'خدمة العملاء', description: 'الدعم والخدمات' },
        { name: 'الإدارة التنفيذية', description: 'الإدارة العليا' },
        { name: 'العمليات واللوجستيات', description: 'إدارة العمليات' },
      ],
    });
    console.log(`✅ ${depts.length} departments\n`);
    // 6. Employees
    console.log('👨‍💼 [6/8] Creating employees...');
    const emps = await employeeRepo.create({
      data: [
        {
          fullName: 'محمد أحمد السيد',
          nationalId: '29501011234567',
          phone: '01012345678',
          address: 'القاهرة، مصر الجديدة',
          birthDate: new Date('1995-01-01'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2020-01-15'),
          baseSalary: 8000,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[0]._id,
          isActive: true,
        },
        {
          fullName: 'فاطمة محمود علي',
          nationalId: '29302052345678',
          phone: '01123456789',
          address: 'الجيزة، المهندسين',
          birthDate: new Date('1993-02-05'),
          gender: GenderEnum.female,
          nationality: 'مصري',
          contractDate: new Date('2019-03-20'),
          baseSalary: 9500,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[0]._id,
          isActive: true,
        },
        {
          fullName: 'أحمد خالد عبدالله',
          nationalId: '29103103456789',
          phone: '01234567890',
          address: 'الإسكندرية، سموحة',
          birthDate: new Date('1991-03-10'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2018-06-01'),
          baseSalary: 12000,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[1]._id,
          isActive: true,
        },
        {
          fullName: 'سارة حسن محمد',
          nationalId: '29604154567890',
          phone: '01098765432',
          address: 'القاهرة، التجمع الخامس',
          birthDate: new Date('1996-04-15'),
          gender: GenderEnum.female,
          nationality: 'مصري',
          contractDate: new Date('2021-02-10'),
          baseSalary: 10500,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[1]._id,
          isActive: true,
        },
        {
          fullName: 'عمر سعيد إبراهيم',
          nationalId: '29205206789012',
          phone: '01187654321',
          address: 'القاهرة، مدينة نصر',
          birthDate: new Date('1992-05-20'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2019-08-15'),
          baseSalary: 11000,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[1]._id,
          isActive: true,
        },
        {
          fullName: 'مريم يوسف أحمد',
          nationalId: '29406257890123',
          phone: '01276543210',
          address: 'الجيزة، الدقي',
          birthDate: new Date('1994-06-25'),
          gender: GenderEnum.female,
          nationality: 'مصري',
          contractDate: new Date('2020-05-01'),
          baseSalary: 9000,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[2]._id,
          isActive: true,
        },
        {
          fullName: 'حسن علي محمود',
          nationalId: '29007308901234',
          phone: '01165432109',
          address: 'القاهرة، شبرا',
          birthDate: new Date('1990-07-30'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2017-10-20'),
          baseSalary: 10000,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[2]._id,
          isActive: true,
        },
        {
          fullName: 'ياسمين كمال فتحي',
          nationalId: '29508359012345',
          phone: '01054321098',
          address: 'القاهرة، الزمالك',
          birthDate: new Date('1995-08-05'),
          gender: GenderEnum.female,
          nationality: 'مصري',
          contractDate: new Date('2021-01-10'),
          baseSalary: 8500,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[3]._id,
          isActive: true,
        },
        {
          fullName: 'كريم طارق سليم',
          nationalId: '29209100123456',
          phone: '01143210987',
          address: 'الجيزة، الهرم',
          birthDate: new Date('1992-09-10'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2019-11-15'),
          baseSalary: 9500,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[3]._id,
          isActive: true,
        },
        {
          fullName: 'نورهان صلاح الدين',
          nationalId: '29710151234567',
          phone: '01032109876',
          address: 'القاهرة، المعادي',
          birthDate: new Date('1997-10-15'),
          gender: GenderEnum.female,
          nationality: 'مصري',
          contractDate: new Date('2022-03-01'),
          baseSalary: 7000,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[4]._id,
          isActive: true,
        },
        {
          fullName: 'أمير وليد حسن',
          nationalId: '29411202345678',
          phone: '01121098765',
          address: 'القاهرة، حدائق القبة',
          birthDate: new Date('1994-11-20'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2020-07-15'),
          baseSalary: 7500,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[4]._id,
          isActive: true,
        },
        {
          fullName: 'ليلى إبراهيم عبدالرحمن',
          nationalId: '28812253456789',
          phone: '01210987654',
          address: 'القاهرة، مصر الجديدة',
          birthDate: new Date('1988-12-25'),
          gender: GenderEnum.female,
          nationality: 'مصري',
          contractDate: new Date('2015-01-10'),
          baseSalary: 18000,
          checkInTime: '09:00',
          checkOutTime: '17:00',
          departmentId: depts[5]._id,
          isActive: true,
        },
        {
          fullName: 'طارق عماد الدين',
          nationalId: '29101304567890',
          phone: '01109876543',
          address: 'الجيزة، فيصل',
          birthDate: new Date('1991-01-30'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2018-04-20'),
          baseSalary: 9000,
          checkInTime: '08:00',
          checkOutTime: '16:00',
          departmentId: depts[6]._id,
          isActive: true,
        },
        {
          fullName: 'دينا رأفت محمد',
          nationalId: '29602055678901',
          phone: '01198765432',
          address: 'القاهرة، مدينة السلام',
          birthDate: new Date('1996-02-05'),
          gender: GenderEnum.female,
          nationality: 'مصري',
          contractDate: new Date('2021-09-01'),
          baseSalary: 8000,
          checkInTime: '08:00',
          checkOutTime: '16:00',
          departmentId: depts[6]._id,
          isActive: true,
        },
        {
          fullName: 'يوسف محمد رشاد',
          nationalId: '29303106789012',
          phone: '01087654321',
          address: 'الجيزة، بولاق الدكرور',
          birthDate: new Date('1993-03-10'),
          gender: GenderEnum.male,
          nationality: 'مصري',
          contractDate: new Date('2019-12-01'),
          baseSalary: 8500,
          checkInTime: '08:00',
          checkOutTime: '16:00',
          departmentId: depts[6]._id,
          isActive: true,
        },
      ],
    });
    console.log(`✅ ${emps.length} employees\n`);

    // 7. Official Holidays
    console.log('🎉 [7/8] Creating holidays...');
    const hols = await holidayRepo.create({
      data: [
        {
          name: 'رأس السنة الميلادية',
          date: new Date('2024-01-01'),
          year: 2024,
          isRecurring: true,
        },
        {
          name: 'عيد الثورة 25 يناير',
          date: new Date('2024-01-25'),
          year: 2024,
          isRecurring: true,
        },
        {
          name: 'عيد الفطر',
          date: new Date('2024-04-10'),
          year: 2024,
          isRecurring: false,
        },
        {
          name: 'عيد تحرير سيناء',
          date: new Date('2024-04-25'),
          year: 2024,
          isRecurring: true,
        },
        {
          name: 'عيد العمال',
          date: new Date('2024-05-01'),
          year: 2024,
          isRecurring: true,
        },
        {
          name: 'عيد الأضحى',
          date: new Date('2024-06-16'),
          year: 2024,
          isRecurring: false,
        },
        {
          name: 'ثورة 23 يوليو',
          date: new Date('2024-07-23'),
          year: 2024,
          isRecurring: true,
        },
        {
          name: 'ذكرى حرب أكتوبر',
          date: new Date('2024-10-06'),
          year: 2024,
          isRecurring: true,
        },
        {
          name: 'رأس السنة الميلادية',
          date: new Date('2025-01-01'),
          year: 2025,
          isRecurring: true,
        },
        {
          name: 'عيد الثورة 25 يناير',
          date: new Date('2025-01-25'),
          year: 2025,
          isRecurring: true,
        },
        {
          name: 'عيد الفطر',
          date: new Date('2025-03-30'),
          year: 2025,
          isRecurring: false,
        },
        {
          name: 'عيد تحرير سيناء',
          date: new Date('2025-04-25'),
          year: 2025,
          isRecurring: true,
        },
        {
          name: 'عيد العمال',
          date: new Date('2025-05-01'),
          year: 2025,
          isRecurring: true,
        },
        {
          name: 'عيد الأضحى',
          date: new Date('2025-06-06'),
          year: 2025,
          isRecurring: false,
        },
        {
          name: 'ثورة 23 يوليو',
          date: new Date('2025-07-23'),
          year: 2025,
          isRecurring: true,
        },
        {
          name: 'ذكرى حرب أكتوبر',
          date: new Date('2025-10-06'),
          year: 2025,
          isRecurring: true,
        },
      ],
    });
    console.log(`✅ ${hols.length} holidays\n`);
    // 8. Attendance (Last 2 months)
    console.log('📅 [8/8] Creating attendance records...');

    // ✅ FIX: Explicitly type the array
    const attData: AttendanceData[] = [];

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
      const m = month - monthOffset;
      const y = m < 0 ? year - 1 : year;
      const adjM = m < 0 ? m + 12 : m;
      const days = new Date(y, adjM + 1, 0).getDate();

      for (const emp of emps) {
        for (let day = 1; day <= days; day++) {
          const date = new Date(y, adjM, day);
          const dow = date.getDay();

          if (dow === 5 || dow === 6) {
            attData.push({
              employeeId: emp._id,
              date,
              status: AttendanceEnum.Holiday,
              overtimeHours: 0,
              lateHours: 0,
              notes: 'إجازة أسبوعية',
            });
            continue;
          }

          if (Math.random() < 0.05) {
            attData.push({
              employeeId: emp._id,
              date,
              status: AttendanceEnum.Abcent,
              overtimeHours: 0,
              lateHours: 0,
              notes: 'غياب',
            });
            continue;
          }

          if (Math.random() < 0.02) {
            attData.push({
              employeeId: emp._id,
              date,
              status: AttendanceEnum.Sick_leave,
              overtimeHours: 0,
              lateHours: 0,
              notes: 'إجازة مرضية',
            });
            continue;
          }

          const baseIn = emp.checkInTime === '08:00' ? 8 : 9;
          const baseOut = emp.checkOutTime === '16:00' ? 16 : 17;
          const checkIn = getRandomTime(baseIn, 45);
          const checkOut = getRandomTime(baseOut, 60);

          const [inH, inM] = checkIn.split(':').map(Number);
          const inMins = inH * 60 + inM;
          const baseMins = baseIn * 60;
          const lateMins = Math.max(0, inMins - baseMins);
          const lateHours = Number((lateMins / 60).toFixed(2));

          const [outH, outM] = checkOut.split(':').map(Number);
          const outMins = outH * 60 + outM;
          const baseOutMins = baseOut * 60;
          const overtimeMins = Math.max(0, outMins - baseOutMins);
          const overtimeHours = Number((overtimeMins / 60).toFixed(2));

          attData.push({
            employeeId: emp._id,
            date,
            checkIn,
            checkOut,
            status: AttendanceEnum.Precent,
            overtimeHours,
            lateHours,
            notes: '',
          });
        }
      }
    }

    // Insert in batches
    const batchSize = 100;
    let created = 0;
    for (let i = 0; i < attData.length; i += batchSize) {
      const batch = attData.slice(i, i + batchSize);
      await attendanceRepo.create({ data: batch });
      created += batch.length;
      if (created % 500 === 0)
        console.log(`   Progress: ${created}/${attData.length}`);
    }
    console.log(`✅ ${attData.length} attendance records\n`);
    // Summary
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    SEEDING COMPLETE! ✅                    ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Time: ${elapsed}s`);
    console.log(`\nData Created:`);
    console.log(`  📋 Permissions: ${permissions.length}`);
    console.log(`  👥 Roles: 4`);
    console.log(`  👤 Users: 4`);
    console.log(`  🏢 Departments: ${depts.length}`);
    console.log(`  👨‍💼 Employees: ${emps.length}`);
    console.log(`  ⚙️  Settings: 6`);
    console.log(`  🎉 Holidays: ${hols.length}`);
    console.log(`  📅 Attendance: ${attData.length}`);
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('  Admin:      admin01 / Admin@123');
    console.log('  HR Manager: hr_manager / Hr@123456');
    console.log('  Accountant: accountant / Account@123');
    console.log('  Viewer:     viewer01 / Viewer@123');
    console.log(
      '═══════════════════════════════════════════════════════════\n',
    );

    await app.close();
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    await app.close();
    process.exit(1);
  }
}

if (require.main === module) {
  seedFinal()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedFinal;
