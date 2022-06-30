import { formatISO } from 'date-fns';

import { IUser } from '../User/user.model';
import { Rehearsal } from './rehearsal.entity';
import {
  IRehearsal,
  IRehearsalFullModel,
  IRehearsalSaveModel,
  RehearsalModel,
  RehearsalStatus,
} from './rehearsal.model';

export class RehearsalRepository {
  public getAllRehearsals(): Promise<IRehearsal[]> {
    const result = RehearsalModel.find().exec();
    return result;
  }
  public createRehearsal(saveModel: IRehearsalSaveModel): Promise<IRehearsal> {
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

  public async getRehearsalById(rehearsalId: string): Promise<IRehearsalFullModel | null> {
    return await RehearsalModel.findById(rehearsalId)
      .populate('createdBy');
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

  // TODO: плохое название
  public async getActiveRehearsalsInConflictWithSlot(from: Date, to: Date): Promise<IRehearsal[]> {
    // TODO: можно переписать на метод exists
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