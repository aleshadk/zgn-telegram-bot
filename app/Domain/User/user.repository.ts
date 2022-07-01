import mongoose, { Schema } from 'mongoose';
import { ICreateUserModel, IUser } from './user.model';

export const USER_SCHEMA_NAME = 'user';

const UserSchema = new Schema(
  {
    telegramId: { type: Number, required: true },
    telegramChatId: { type: Number, required: true },
    telegramName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    isAdmin: { type: Boolean },
  },
  {
    timestamps: true
  }
)

const UserModel = mongoose.model<IUser>(USER_SCHEMA_NAME, UserSchema);

export class UserRepository {
  public isUserRegistered(telegramId: number): Promise<boolean> {
    return UserModel.count({telegramId})
      .then(count => count > 0);
  }

  public async getUserByTelegramId(telegramId?: number): Promise<IUser | null> {
    if (!telegramId) {
      return null;
    }

    return await UserModel.findOne({telegramId})
  }

  public async getAdminUsers(): Promise<IUser[]> {
    return await UserModel.find({ isAdmin: true });
  }

  public createUser(model: ICreateUserModel): Promise<IUser> {
    const user = new UserModel(model);

    return new Promise<IUser>((resolve, reject) => {
      user.save(error => {
        if (error) {
          console.log(error);
          reject();
          return;
        }

        resolve(user);
      });
    });
  }
}

export const userRepository = new UserRepository();