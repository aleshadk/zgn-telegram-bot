import dotenv from 'dotenv';

dotenv.config();

export const appEnvironment = {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  mongoConnectionString: process.env.MONGO_CONNECTION_STRING!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: process.env.PORT!,
  prod: process.env.NODE_ENV === 'production'
};
