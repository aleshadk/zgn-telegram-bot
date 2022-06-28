import { IRehearsalFullModel, RehearsalStatus } from '../../Domain/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { telegramBot } from '../../moh/sidr';
import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';
import { NotifyAdminAboutRehearsalStatusChangeHandler } from './notify-admin-about-rehearsal-status-change.handler';

export class RejectRehearsalHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;

    public async handle(
        rehearsalId: string,
        currentUserTelegramName: string,
    ): Promise<string | undefined> {
        const rehearsal = await this.rehearsalRepository.getRehearsalById(rehearsalId);

        if (!rehearsal) {
            return;
        }

        if (rehearsal.status === RehearsalStatus.Rejected) {
            return 'Эту репетицию и так уже кто-то отклонил';
        }

        const updatedRehearsal = await this.rehearsalRepository.changeRehearsalStatus(rehearsalId, RehearsalStatus.Rejected);

        if (!updatedRehearsal) {
            return 'Что-то сломалось';
        }

        this.notifyRehearsalOwner(rehearsal);
        this.notifyAdmins(rehearsal, currentUserTelegramName);
    }


    private async notifyAdmins(
        rehearsal: IRehearsalFullModel,
        confirmedByTelegramName: string,
    ): Promise<void> {
        const rehearsalDateTime = formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime);
        const message = `❌❌❌ Репетицию ${rehearsal.createdBy.firstName} (тел. ${rehearsal.createdBy.phone}) ${rehearsalDateTime} отклонил ${confirmedByTelegramName}`;

        void new NotifyAdminAboutRehearsalStatusChangeHandler().handle(message);
    }

    private notifyRehearsalOwner(rehearsal: IRehearsalFullModel): void {
        telegramBot.telegram.sendMessage(
            rehearsal.createdBy.telegramChatId,
            `❌ Мы не можем обеспечить репетицию ${formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime)}!`
        );
    }
}
