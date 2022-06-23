import mongoose, { Document, Schema } from 'mongoose';

export interface ICreateUserModel {
    firstName: string,
    telegramId: number,
    lastName?: string,
    telegramName?: string,
    isAdmin: boolean,
    phone?: string,
}
export interface IUser extends Document, ICreateUserModel {}
export interface IGetUserModel extends Partial<ICreateUserModel> {}
export interface IUpdateUserModel {
    telegramId: number;
    phone: string;
}

const UserSchema: Schema = new Schema({

    telegramId: { type: Number, required: true },
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

export const UserModel = mongoose.model<IUser>('user', UserSchema);