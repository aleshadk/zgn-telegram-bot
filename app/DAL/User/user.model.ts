import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    phone: string;
    isAdmin: boolean;
}

const UserSchema: Schema = new Schema({
    title: { type: String, required: true },
    phone: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
},
    {
        timestamps: true
    }
)

export const UserModel = mongoose.model<IUser>('user', UserSchema);