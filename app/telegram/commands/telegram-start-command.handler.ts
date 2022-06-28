import { Context } from 'telegraf';

import { UserRepository } from '../../Domain/User/user.repository';

class TelegramStartCommandHandler {
    private readonly userRepository = new UserRepository;;


    public async handle(ctx: Context): Promise<void> {
        const fromId = ctx.from!.id!;

        let user = await this.userRepository.getUser({ telegramId: fromId });

        if (!user) {
            await this.processNewUser(ctx);
            ctx.reply(`Привет, ${ctx.from!.first_name}! Мы добавили тебя в систему, но чтобы пользоваться ботом нужно сначала отправить свой номер телефона`);
            return;
        }

        if (user && !user.phone) {
            this.handleMessageFromUserWithoutPhone(ctx);
            return;
        }

        ctx.reply(`У тебя всё настроено 🤟`);
    }

    private async processNewUser(ctx: Context): Promise<void> {
        await this.userRepository.createUser({
            firstName: ctx.from!.first_name,
            isAdmin: false,
            lastName: ctx.from!.last_name,
            telegramId: ctx.from!.id,
            telegramName: ctx.from!.username,
            telegramChatId: ctx.chat!.id
        });
    }

    private handleMessageFromUserWithoutPhone(ctx: Context): void {
        ctx.telegram.sendMessage(ctx.message!.chat.id, `Чтобы пользоваться ботом нужно сначала отправить свой номер телефона`);
    }
}

export function handleTelegramStartCommand(ctx: Context): Promise<void> {
    return new TelegramStartCommandHandler().handle(ctx);
}