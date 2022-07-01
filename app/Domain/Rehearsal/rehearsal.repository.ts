import { formatISO } from 'date-fns';
import mongoose, { Schema } from 'mongoose';

import { IUser } from '../User/user.model';
import { USER_SCHEMA_NAME } from '../User/user.repository';
import { Rehearsal, RehearsalFull } from './rehearsal.entity';
import {
  IRehearsal,
  IRehearsalFull,
  ICreateRehearsalModel,
  RehearsalStatus,
} from './rehearsal.model';

const REHEARSAL_SCHEMA_NAME = 'rehearsal';

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

const RehearsalModel = mongoose.model<IRehearsal>(REHEARSAL_SCHEMA_NAME, RehearsalSchema);

export class RehearsalRepository {
  public createRehearsal(saveModel: ICreateRehearsalModel): Promise<IRehearsal> {
    const rehearsal = new RehearsalModel(saveModel);

    return new Promise<IRehearsal>((resolve, reject) => {
      rehearsal.save(error => {
        if (error) {
          reject();
          return;
        }

        resolve(rehearsal);
      });
    });
  }

  public async getRehearsalById(rehearsalId: string): Promise<RehearsalFull | null> {
    return await RehearsalModel.findById<IRehearsalFull>(rehearsalId)
      .populate('createdBy')
      .then(x => x ? new RehearsalFull(x) : null);
  }

  public async changeRehearsalStatus(rehearsalId: string, status: RehearsalStatus): Promise<IRehearsal | null> {
    return await RehearsalModel.findByIdAndUpdate(rehearsalId, { status });
  }

  public async getUserActiveRehearsals(user: IUser): Promise<Rehearsal[]> {
    const models = await RehearsalModel
      .find({
        createdBy: user,
        endTime: {
          $gt: formatISO(new Date())
        }
      })
      .sort({
        startTime: 1,
      });

    return models.map(x => new Rehearsal(x));
  }

  // TODO: bad naming
  public async getActiveRehearsalsInConflictWithSlot(from: Date, to: Date): Promise<IRehearsal[]> {
    // TODO: can use exists method
    return new Promise<IRehearsal[]>((resolve) => {
      const statuses = [
        RehearsalStatus.Draft,
        RehearsalStatus.Confirmed,
      ];

      RehearsalModel.find({
        $or: [
          {
            startTime: { $gte: formatISO(from), $lt: formatISO(to) },
            status: statuses
          },
          {
            endTime: { $gt: formatISO(from), $lt: formatISO(to) },
            status: statuses
          }
        ]

      }).then(result => resolve(result));
    });
  }

}

export const rehearsalRepository = new RehearsalRepository();