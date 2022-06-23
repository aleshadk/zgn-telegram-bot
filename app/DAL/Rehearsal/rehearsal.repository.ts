import { ICreateUserModel, IUser } from '../User/user.model';
import { IRehearsal, IRehearsalSaveModel, RehearsalModel } from './rehearsal.model';

export class RehearsalRepository {
    public getAllRehearsals(): Promise<IRehearsal[]> {
        const result = RehearsalModel.find().exec();
        result.catch(e => console.log(e));

        return result;
    }

    public createRehearsal(saveModel: IRehearsalSaveModel): Promise<IRehearsal> {
        const rehearsal = new RehearsalModel(saveModel);

        return new Promise<IRehearsal>((resolve, reject) => {
            rehearsal.save(error => {
                if (error) {
                    console.log(error);
                    reject();
                    return;
                }

                resolve(rehearsal);
            })
        })
    }
}