import { Context, Markup, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { UserRepository } from '../DAL/User/user.repository';
import { isValidPhone } from '../Services/PhoneService';
import { BookRehearsalHandler } from './handlers/BookRehearsalHandler';
import { GetAvailableRehearsalDuractionHandler } from './handlers/GetAvailableRehearsalDuractionHandler';
import { GetAvailableRehearsalStartTimeHandler } from './handlers/GetAvailableRehearsalStartTimeHandler';
import { StartScheduleHandler } from './handlers/StartSchedulingHandler';

export class TelegramBot { // TODO: rename class
    private readonly userRepository = new UserRepository();
    constructor(token: string) {
        const bot: Telegraf<Context<Update>> = new Telegraf(token);

        bot.start(async (ctx) => {
            let user = await this.userRepository.getUser({ telegramId: ctx.from.id });

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
                });
            }

            ctx.reply(`Привет, ${user.firstName}!`);
            this.handleMessageFromUserWithoutPhone(ctx);
        });

        bot.command("inline", async (ctx) => {
            const daysToSchedule = new StartScheduleHandler().handle();

            await ctx.reply("Выбери нужный день", {
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

        bot.action(/datechosen+/, (ctx) => {
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

        bot.action(/durationchosen+/, async (ctx) => {
            const data = ctx.match.input.replace('durationchosen__', '');
            const [rehearsalDate, duration] = data.split('__');

            const slots = await new GetAvailableRehearsalStartTimeHandler().handle({rehearsalDate, duration});
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

        bot.action(/slotchosen+/, async ctx => {
            const data = ctx.match.input.replace('slotchosen__', '');
            const [rehearsalDate, duration, startTime] = data.split('__');

            const result = await new BookRehearsalHandler().handle({
                duration,
                rehearsalDate,
                startTime,
                userTelegramId: ctx.from?.id!
            });

            ctx.reply(result.message);
        });


        bot.on('text', async (ctx) => {
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

        bot.launch();
    }

    private handleMessageFromUserWithoutPhone(ctx: Context): void {
        ctx.telegram.sendMessage(ctx.message!.chat.id, `${ctx.from?.first_name}, чтобы продолжить работу нужно ввести свой телефон`);
    }
}