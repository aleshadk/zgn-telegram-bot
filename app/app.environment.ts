import dotenv from 'dotenv';

dotenv.config();

export const appEnvironment = {
  mongoConnectionString: process.env.MONGO_CONNECTION_STRING!,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
}