import { formatISO } from 'date-fns';
import { IRehearsal, IRehearsalSaveModel, RehearsalModel } from './rehearsal.model';
import { IUser } from '../User/user.model';

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
            })
        })
    }

    public async getRehearsalById(rehearsalId: string): Promise<IRehearsal | null> {
        return await RehearsalModel.findById(rehearsalId);
    }

    public async confirmRehearsal(rehearsalId: string): Promise<IRehearsal | null> {
        return await RehearsalModel.findByIdAndUpdate(rehearsalId, {isConfirmed: true});
    }

    public async getUserActiveRehearsals(user: IUser): Promise<IRehearsal[]> {
        return await RehearsalModel.find({
            createdBy: user,
            endTime: {
                $gt: formatISO(new Date())
            }
        });
    }

    public async getRehearsalsWhereStartTimeBetween(from: Date, to: Date): Promise<IRehearsal[]> {
        // TODO: можно переписать на метод exists
        return new Promise<IRehearsal[]>((resolve) => {
            
            RehearsalModel.find({
                $or: [
                    {
                        startTime: { $gte: formatISO(from), $lt: formatISO(to) }
                    }, 
                    {
                        endTime: { $gt: formatISO(from), $lt: formatISO(to) },
                    }
                ] 
                
            }).then(result => resolve(result))
        })
    }

}