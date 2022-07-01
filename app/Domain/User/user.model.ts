export interface ICreateUserModel {
  telegramId: number;
  telegramChatId: number;
  firstName: string;
  phone: string;
  isAdmin: boolean;
  lastName?: string;
  telegramName?: string;
}

export interface IUser extends ICreateUserModel {
  _id: string;
}
