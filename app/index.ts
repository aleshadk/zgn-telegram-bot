import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

import { initApp } from './app.initializer';
import { TelegramBot } from './telegram/Temp';


const app = express();
const port = process.env.PORT;


app.get('/', (req: Request, res: Response) => {
    res.send(process.env.EXAMPLE);
  });

dotenv.config();
initApp();
new TelegramBot();


app.get('/moh', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});