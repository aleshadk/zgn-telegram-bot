import dotenv from 'dotenv';

dotenv.config();

export const appEnvironment = {
  mongoConnectionString: process.env.MONGO!,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
}