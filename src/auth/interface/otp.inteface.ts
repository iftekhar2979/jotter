import mongoose from "mongoose";

export interface otp{
    _id:mongoose.Types.ObjectId;
    userID:mongoose.Types.ObjectId;
    oneTimePassword:string;
    attempts?:number
    expiredAt: Date;
    createdAt:Date;
    updatedAt:Date
}