import { Context, Markup } from 'telegraf';

import { UserRepository } from '../Domain/User/user.repository';
import { BookRehearsalHandler } from '../handlers/rehearsal-booking/book-rehearsal.handler';
import {
    GetAvailableRehearsalDuractionHandler,
} from '../handlers/rehearsal-booking/get-available-rehearsal-duration.handler';
import {
    GetAvailableRehearsalStateDatesHandler,
} from '../handlers/rehearsal-booking/get-available-rehearsal-start-dates.handler';
import {
    GetAvailableRehearsalStartTimeSlotsHandler,
} from '../handlers/rehearsal-booking/get-available-rehearsal-start-time-slots.handler';
import { ConfirmRehearsalHandler } from '../handlers/rehearsal-confirmation/confirm-rehearsal.handler';
import { RejectRehearsalHandler } from '../handlers/rehearsal-confirmation/reject-rehearsal.handler';
import {
    SendRehearsalConfirmationMessageToAdminsHandler,
} from '../handlers/rehearsal-confirmation/send-rehearsal-confirmation-message-to-admins.handler';
import { GetMyRehearsalsHandler } from '../handlers/user/get-my-rehearsals.handler';
import { isValidPhone } from '../utils/phoneUtils';
import { telegramBot } from './telegramBot';

export class TelegramBot { // TODO: rename class
    private readonly userRepository = new UserRepository();
    constructor() {
        telegramBot.start(async (ctx) => {
            let user = await this.userRepository.getUser({ telegramId: ctx.from.id });
            console.log(ctx.chat.id);

            if (user) {
                if (user.phone) {
                    ctx.reply(`${user.firstName} всё настроено!`);
                    return;
                }

                this.handleMessageFromUserWithoutPhone(ctx);
                return;
            }

            if (!user) {
                user = await this.userRepository.createUser({
                    firstName: ctx.from.first_name,
                    isAdmin: false,
                    lastName: ctx.from.last_name,
                    telegramId: ctx.from.id,
                    telegramName: ctx.from.username,
                    telegramChatId: ctx.chat.id
                });
            }

            ctx.reply(`Привет, ${user.firstName}!`);
            this.handleMessageFromUserWithoutPhone(ctx);
        });

        telegramBot.command('start_booking', async (ctx) => {
            const daysToSchedule = new GetAvailableRehearsalStateDatesHandler().handle();

            await ctx.reply('Выбери день репетиции', {
                reply_markup: {
                    inline_keyboard: [
                        ...daysToSchedule.map(x => {
                            return [
                                Markup.button.callback(x.label, `datechosen__${x.value.getTime()}`, true)
                            ]
                        })
                    ]
                }
            });
        });

        telegramBot.command('get_my_rehearsals', async ctx => {
            const result = await new GetMyRehearsalsHandler().handle(ctx.from?.id!);

            if (result.length === 0) {
                ctx.reply('У тебя нет активных репетиций 😱');
                return;
            }

            const response = `У тебя есть вот такие репетиции: \n\n${result.map(x => x.label).join('\n')}`;

            ctx.reply(response);
        });

        // datechosen__{{date.getTime()}}
        telegramBot.action(/datechosen+/, (ctx) => {
            const date = ctx.match.input.replace('datechosen__', '');
            const durations = new GetAvailableRehearsalDuractionHandler().handle();

            ctx.reply("Выбери длительность репетиции", {
                reply_markup: {
                    inline_keyboard: [
                        ...durations.map(x => {
                            return [
                                Markup.button.callback(`${x} ч.`, `durationchosen__${date}__${x}`, true)
                            ]
                        })
                    ]
                }
            });
        });

        // datechosen__{{date.getTime()}}__{{длиттельность репетиции в часах (number)}}
        telegramBot.action(/durationchosen+/, async (ctx) => {
            const data = ctx.match.input.replace('durationchosen__', '');
            const [rehearsalDate, duration] = data.split('__');

            const slots = await new GetAvailableRehearsalStartTimeSlotsHandler().handle({rehearsalDate, duration});

            if (slots.length === 0) {
                ctx.reply('В этот день нет подходящих по длительности слотов :(');
                return;
            }

            ctx.reply("Выбери время начала репетиции", {
                reply_markup: {
                    inline_keyboard: [
                        ...slots.map(x => {
                            return [
                                Markup.button.callback(`${x}`, `slotchosen__${rehearsalDate}__${duration}__${x}`, true)
                            ]
                        })
                    ]
                }
            });
        });

        // TODO: нужно везде делать JSON и делать маппер из джейсона в модель, который будет возвращать типизированную модель или null 
        telegramBot.action(/slotchosen+/, async ctx => {
            const data = ctx.match.input.replace('slotchosen__', '');
            const [rehearsalDate, duration, startTime] = data.split('__');

            const result = await new BookRehearsalHandler().handle({
                duration,
                rehearsalDate,
                startTime,
                userTelegramId: ctx.from?.id!
            });

            ctx.reply(result.message);
            if (result.rehearsal) {
                await new SendRehearsalConfirmationMessageToAdminsHandler().handle(telegramBot, result.rehearsal);
            }
        });

        telegramBot.action(/rehearsal_confirmed+/, async ctx => {
            const rehearsalId = ctx.match.input.replace('rehearsal_confirmed__', '');
            new ConfirmRehearsalHandler().handle(ctx, telegramBot, rehearsalId);
        });

        telegramBot.action(/rehearsal_rejected+/, async ctx => {
            const rehearsalId = ctx.match.input.replace('rehearsal_rejected__', '');
            new RejectRehearsalHandler().handle(ctx, telegramBot, rehearsalId);
        });

        telegramBot.on('text', async (ctx) => {
            const user = await this.userRepository.getUser({ telegramId: ctx.from.id });

            if (!user?.phone) {
                if (isValidPhone(ctx.message.text)) {
                    await this.userRepository.update({ telegramId: ctx.from.id, phone: ctx.message.text });
                    ctx.reply(`${ctx.from.first_name} всё настроено!`);
                    return;
                }

                this.handleMessageFromUserWithoutPhone(ctx);
                return;
            }

            ctx.reply(`${ctx.from.first_name} всё настроено!`);
        });

        telegramBot.launch();
    }

    private handleMessageFromUserWithoutPhone(ctx: Context): void {
        ctx.telegram.sendMessage(ctx.message!.chat.id, `${ctx.from?.first_name}, чтобы продолжить работу нужно ввести свой телефон`);
    }
}