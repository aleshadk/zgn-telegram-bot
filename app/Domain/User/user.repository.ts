import {ICreateUserModel, UserModel, IUser, IGetUserModel, IUpdateUserModel} from './user.model';

export class UserRepository {
    public getAllUsers(): Promise<IUser[]> {
        const result = UserModel.find().exec();
        result.catch(e => console.log(e));

        return result;
    }

    public getUser(model: IGetUserModel): Promise<IUser | undefined> {
        return new Promise<IUser | undefined>((resolve) => {
            UserModel.findOne(model)
                .then(user => resolve(user || undefined))
                .catch(error => {
                    console.log(error);
                    resolve(undefined);
                })
            })
        
    }

    public async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }

    public async getAdminUsers(): Promise<IUser[]> {
        return await UserModel.find({isAdmin: true});
    }

    public createUser(model: ICreateUserModel): Promise<IUser> {
        const user = new UserModel(model);
        user._id;

        return new Promise<IUser>((resolve, reject) => {
            user.save(error => {
                if (error) {
                    console.log(error);
                    reject();
                    return;
                }

                resolve(user);
            })
        })
    }

    public async update(model: IUpdateUserModel): Promise<void> { // TODO: remove void
        await UserModel.findOneAndUpdate({telegramId: model.telegramId}, {phone: model.phone});
    }
}