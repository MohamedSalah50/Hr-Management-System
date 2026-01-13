import { Types } from "mongoose";

export interface IRole {
    name: string;
    description?: string;
    permissions: Types.ObjectId[];
}