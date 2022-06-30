import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

import { initApp } from './app.initializer';
import { TelegramListener } from './telegram/telegram-listener';

const app = express();
const port = process.env.PORT;

app.get('/', (_req: Request, res: Response) => {
  console.log('/ GET');
  res.send('I am working');
});

dotenv.config();
initApp();
new TelegramListener();

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});