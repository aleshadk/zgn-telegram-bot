import mongoose, { Document, Schema } from 'mongoose';
import { IUser, __user_schema_name } from '../User/user.model';

const __rehearsal_schema_name = 'rehearsal';

export enum RehearsalStatus {
    Draft,
    Confirmed,
    Rejected,
    AbandonByUser,
}

export interface IRehearsalSaveModel {
    startTime: Date;
    endTime: Date;
    status: RehearsalStatus;
    createdBy: IUser;
}

export interface IRehearsal extends IRehearsalSaveModel, Document { }

const RehearsalSchema: Schema = new Schema({

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: __user_schema_name },
},
    {
        timestamps: true
    }
)

export const RehearsalModel = mongoose.model<IRehearsal>(__rehearsal_schema_name, RehearsalSchema);