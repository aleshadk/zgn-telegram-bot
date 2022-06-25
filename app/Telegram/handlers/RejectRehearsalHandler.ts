import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { IRehearsal, RehearsalStatus } from '../../DAL/Rehearsal/rehearsal.model';

import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { IUser } from '../../DAL/User/user.model';
import { UserRepository } from '../../DAL/User/user.repository';
import { formatRehearsalDateWithDuration } from '../../Services/DateUtils';
import { NotifyAdminAboutRehearsalStatusChangeHandler } from '../notification_handlers/NotifyAdminAboutRehearsalStatusChangeHandler';

export class RejectRehearsalHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;;

    public async handle(
        ctx: Context,
        bot: Telegraf<Context<Update>>,
        rehearsalId: string
    ): Promise<void> {
        const rehearsal = await this.rehearsalRepository.getRehearsalById(rehearsalId);
        const rehearsalCreatedBy = await this.userRepository.getUserById(rehearsal?.createdBy as string); // TODO Refactor

        if (!rehearsal) {
            return;
        }

        if (rehearsal.status === RehearsalStatus.Rejected) {
            ctx.reply('Эту репетицию и так уже кто-то отклонил');
            return;
        }

        const updatedRehearsal = await this.rehearsalRepository.changeRehearsalStatus(rehearsalId, RehearsalStatus.Rejected);

        if (!updatedRehearsal) {
            // TODO: может добавить логи?
            ctx.reply('Что-то сломалось');
            return;
        }

        bot.telegram.sendMessage(rehearsalCreatedBy.telegramChatId, `❌ Мы не можем обеспечить репетицию ${formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime)}!`);

        void new NotifyAdminAboutRehearsalStatusChangeHandler().handle(
            bot,
            this.getRehearsalRejectdMessage(
                rehearsalCreatedBy,
                rehearsal,
                ctx.from?.first_name!
            )
        );
    }

    private getRehearsalRejectdMessage(
        rehearsalCreatedBy: IUser,
        rehearsal: IRehearsal,
        confirmedByTelegramName: string
    ): string {
        const rehearsalDateTime = formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime);
        return `❌❌❌ Репетицию ${rehearsalCreatedBy.firstName} (тел. ${rehearsalCreatedBy.phone}) ${rehearsalDateTime} отклонил ${confirmedByTelegramName}`;
    }
}
