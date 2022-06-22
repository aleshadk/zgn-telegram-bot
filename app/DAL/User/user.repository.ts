import {UserModel, IUser} from './user.model';

export class UserRepository {
    public getAllUsers(): Promise<IUser[]> {
        const result = UserModel.find().exec();
        result.catch(e => console.log(e));

        return result;
    }
}