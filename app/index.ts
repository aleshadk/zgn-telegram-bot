import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {AppInitializer} from './app.initializer';
import { UserController } from './WEB/user.controller';
import { RehearsalController } from './WEB/rehearsal.controller';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const appInitializer = new AppInitializer(process.env);
appInitializer.init();

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

const userController = new UserController();
const rehearsalController = new RehearsalController();
app.get('/users', (req: Request, res: Response) => userController.getAllUsers(req, res));
app.get('/rehearsal', (req: Request, res: Response) => rehearsalController.getAllRehearsals(req, res));