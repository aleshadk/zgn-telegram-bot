import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

import { IRehearsal, RehearsalStatus } from '../../Domain/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { IUser } from '../../Domain/User/user.model';
import { UserRepository } from '../../Domain/User/user.repository';
import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';
import { NotifyAdminAboutRehearsalStatusChangeHandler } from './notify-admin-about-rehearsal-status-change.handler';

export class ConfirmRehearsalHandler {
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

        if (rehearsal.status !== RehearsalStatus.Draft) {
            let message: string;
            switch (rehearsal.status) {
                case RehearsalStatus.Rejected:
                    message = 'Эту репетицию уже кто-то отклонил ❌';
                    break;
                case RehearsalStatus.Confirmed:
                    message = 'Эту репетицию уже кто-то подтвердил ✅';
                    break;
                default:
                    break;
            }

            ctx.reply(message);
            return;
        }

        const updatedRehearsal = await this.rehearsalRepository.changeRehearsalStatus(rehearsalId, RehearsalStatus.Confirmed);

        if (!updatedRehearsal) {
            // TODO: может добавить логи?
            ctx.reply('Что-то сломалось');
            return;
        }

        bot.telegram.sendMessage(rehearsalCreatedBy.telegramChatId, `Твоя репетиция ${formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime)} подтверждена!`);

        void new NotifyAdminAboutRehearsalStatusChangeHandler().handle(
            this.getRehearsalConfirmedMessage(rehearsalCreatedBy, rehearsal, ctx.from?.first_name!)
        );
    }

    private getRehearsalConfirmedMessage(
        rehearsalCreatedBy: IUser,
        rehearsal: IRehearsal,
        confirmedByTelegramName: string
    ): string {
        const rehearsalDateTime = formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime);
        return `✅ Репетицию ${rehearsalCreatedBy.firstName} (тел. ${rehearsalCreatedBy.phone}) ${rehearsalDateTime} подтвердил ${confirmedByTelegramName}`;
    }
}
