import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

import { initApp } from './app.initializer';
import { TelegramBot } from './moh/Temp';


const app = express();
const port = process.env.PORT;


app.get('/', (_req: Request, res: Response) => {
  res.send('I am working');
});

dotenv.config();
initApp();
new TelegramBot();


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});