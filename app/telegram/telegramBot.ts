import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';

import { appEnvironment } from '../app.environment';

export const telegramBot: Telegraf<Context<Update>> = new Telegraf(appEnvironment.telegramBotToken);