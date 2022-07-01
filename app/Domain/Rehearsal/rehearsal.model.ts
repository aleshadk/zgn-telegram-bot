import { IUser } from '../User/user.model';

export enum RehearsalStatus {
  Draft,
  Confirmed,
  Rejected,
  AbandonByUser,
}

export interface IRehearsal {
  _id: string;
  startTime: Date;
  endTime: Date;
  status: RehearsalStatus;
}

export interface IRehearsalFull extends IRehearsal {
  createdBy: IUser;
}

export interface ICreateRehearsalModel {
  startTime: Date;
  endTime: Date;
  status: RehearsalStatus;
  createdBy: IUser;
}
