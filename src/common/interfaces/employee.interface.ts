import { Types } from "mongoose";


export interface IEmployee{
    fullName: string;
    nationalId: string;
    address: string;
    birthDate: Date;
    gender: string;
    nationality: string;
    contractDate: Date;
    baseSalary: number;
    checkInTime: string;
    checkOutTime: string;
    departmentId: Types.ObjectId;
    isActive: boolean
}
