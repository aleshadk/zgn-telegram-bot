import dotenv from 'dotenv';

import { initApp } from './app.initializer';
import { TelegramBot } from './telegram/Temp';

dotenv.config();
initApp();
new TelegramBot();
