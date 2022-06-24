import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../DAL/User/user.repository';
import { formatRehearsalDateWithDuration } from '../../Services/DateUtils';

export class ConfirmRehearsalHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;;


    public async handleConfirm(
        ctx: Context,
        bot: Telegraf<Context<Update>>,
        rehearsalId: string
    ): Promise<void> {
        const rehearsal = await this.rehearsalRepository.getRehearsalById(rehearsalId);

        if (!rehearsal) {
            return;
        }

        if (rehearsal.isConfirmed) {
            ctx.reply('А её уже кто-то подтвердил 🙄');
            return;
        }

        const updatedRehearsal = await this.rehearsalRepository.confirmRehearsal(rehearsalId);

        if (!updatedRehearsal) {
            // TODO: может добавить логи?
            ctx.reply('Что-то сломалось');
            return;
        }

        bot.telegram.sendMessage(rehearsal.createdBy.telegramChatId, `Твоя репетиция ${formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime)} подтверждена!`);
        ctx.reply('Всё ок, репетиция подтверждена');

        const admins = await this.userRepository.getAdminUsers();
        admins
            .filter(x => x.telegramId !== ctx.from?.id)
            .forEach(x => {
                bot.telegram.sendMessage(x.telegramId, `Репетицию ${rehearsal.createdBy.firstName} (тел. ${rehearsal.createdBy.phone}) уже подтвердил ${ctx.from?.first_name}`);
            });
    }
}
