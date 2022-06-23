import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { UserRepository } from '../DAL/User/user.repository';
import { isValidPhone } from '../Services/PhoneService';
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export class TelegramBot { // TODO: rename class
    private readonly userRepository = new UserRepository();
    constructor(token: string) {
        const bot: Telegraf<Context<Update>> = new Telegraf(token);

        bot.start(async (ctx) => {
            let user = await this.userRepository.getUser({telegramId: ctx.from.id});

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

          bot.on('text', async (ctx) => {
            const user = await this.userRepository.getUser({telegramId: ctx.from.id});

            if (!user?.phone) {
                if (isValidPhone(ctx.message.text)) {
                    await this.userRepository.update({telegramId: ctx.from.id, phone: ctx.message.text});
                    ctx.reply(`${ctx.from.first_name} всё настроено!`);
                    return;
                }

                this.handleMessageFromUserWithoutPhone(ctx);
                return;
            }

            ctx.reply(`${ctx.from.first_name} всё настроено!`);
          })
        
          bot.launch();
    }

    private handleMessageFromUserWithoutPhone(ctx: Context): void {
        ctx.telegram.sendMessage(ctx.message!.chat.id, `${ctx.from?.first_name}, чтобы продолжить работу нужно ввести свой телефон`);
    }
}