import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../User/user.model';
import { USER_SCHEMA_NAME } from '../User/user.repository';

const __rehearsal_schema_name = 'rehearsal';

export enum RehearsalStatus {
  Draft,
  Confirmed,
  Rejected,
  AbandonByUser,
}

export interface IRehearsalModel {
  _id: string;
  startTime: Date;
  endTime: Date;
  status: RehearsalStatus;
}

export interface IRehearsalFullModel {
  _id: string;
  startTime: Date;
  endTime: Date;
  status: RehearsalStatus;
  createdBy: IUser;
}

export interface IRehearsalSaveModel {
  startTime: Date;
  endTime: Date;
  status: RehearsalStatus;
  createdBy: IUser;
}

export interface IRehearsal extends IRehearsalSaveModel, Document { }

const RehearsalSchema: Schema = new Schema(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: USER_SCHEMA_NAME },
  },
  {
    timestamps: true
  }
);

export const RehearsalModel = mongoose.model<IRehearsal>(__rehearsal_schema_name, RehearsalSchema);