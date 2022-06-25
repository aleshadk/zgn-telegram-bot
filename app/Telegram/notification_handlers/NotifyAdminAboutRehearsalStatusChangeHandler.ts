import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

import { UserRepository } from '../../DAL/User/user.repository';

export class NotifyAdminAboutRehearsalStatusChangeHandler {
    private readonly userRepository = new UserRepository;

    public async handle(bot: Telegraf<Context<Update>>, message: string): Promise<void> {
        const admins = await this.userRepository.getAdminUsers();
        admins.forEach(x => {
            bot.telegram.sendMessage(x.telegramId, message);
        });
    }
}
