import dotenv from 'dotenv';

import { initApp } from './app.initializer';
import { TelegramBot } from './Telegram/Temp';

dotenv.config();
initApp();
new TelegramBot();
