import { formatISO } from 'date-fns';
import { IRehearsal, IRehearsalSaveModel, RehearsalModel } from './rehearsal.model';

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

    public async getRehearsalsWhereStartTimeBetween(from: Date, to: Date): Promise<IRehearsal[]> {
        // TODO: можно переписать на метод exists
        return new Promise<IRehearsal[]>((resolve) => {
            
            RehearsalModel.find({
                $or: [
                    {
                        startTime: { $gte: formatISO(from), $lt: formatISO(to) }
                    }, 
                    {
                        endTime: { $gte: formatISO(from), $lt: formatISO(to) },
                    }
                ] 
                
            }).then(result => resolve(result))
        })
    }

    // TODO: какая-то хуйня
    public getRehearsalBetweenDates(from: Date, to: Date): void {
    }
}