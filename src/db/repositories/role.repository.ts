import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import {  RoleDocument as TDocument, Role } from "../models";


@Injectable()
export class RoleRepository extends DatabaseRepository<Role> {
    constructor(
        @InjectModel(Role.name) protected override readonly model: Model<TDocument>
    ) {
        super(model);
    }
}