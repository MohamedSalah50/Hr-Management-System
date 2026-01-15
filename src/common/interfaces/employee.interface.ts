import { Types } from "mongoose";
import { GenderEnum } from "../enums";


export interface IEmployee {
    fullName: string;
    nationalId: string;
    phone: string;
    address: string;
    birthDate: Date;
    gender: GenderEnum;
    nationality: string;
    contractDate: Date;
    baseSalary: number;
    checkInTime: string;
    checkOutTime: string;
    departmentId: Types.ObjectId;
    isActive: boolean;
}
