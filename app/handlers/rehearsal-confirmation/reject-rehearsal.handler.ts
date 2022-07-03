import { RehearsalFull } from '../../Domain/Rehearsal/rehearsal.entity';
import { RehearsalStatus } from '../../Domain/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { telegramBot } from '../../telegram/telegram-bot';
import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';
import { NotifyAdminAboutRehearsalStatusChangeHandler } from './notify-admin-about-rehearsal-status-change.handler';

export class RejectRehearsalHandler {
  private readonly rehearsalRepository = new RehearsalRepository;

  public async handle(
    rehearsalId: string,
    currentUserTelegramName: string,
  ): Promise<string | undefined> {
    // TODO: check admin permissions
    const rehearsal = await this.rehearsalRepository.getRehearsalById(rehearsalId);

    if (!rehearsal) {
      return;
    }

    if (!rehearsal.isActive()) {
      return 'Эта репетиция и так не активна';
    }

    const updatedRehearsal = await this.rehearsalRepository.changeRehearsalStatus(rehearsalId, RehearsalStatus.Rejected);

    if (!updatedRehearsal) {
      return 'Что-то сломалось';
    }

    this.notifyRehearsalOwner(rehearsal);
    this.notifyAdmins(rehearsal, currentUserTelegramName);
  }


  private async notifyAdmins(
    rehearsal: RehearsalFull,
    rejectedByTelegramName: string,
  ): Promise<void> {
    const rehearsalDateTime = formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime);
    const message = `❌❌❌ Репетицию ${rehearsal.createdBy.firstName} (тел. ${rehearsal.createdBy.phone}) ${rehearsalDateTime} отклонил ${rejectedByTelegramName}`;

    void new NotifyAdminAboutRehearsalStatusChangeHandler().handle(message);
  }

  private notifyRehearsalOwner(rehearsal: RehearsalFull): void {
    telegramBot.telegram.sendMessage(
      rehearsal.createdBy.telegramChatId,
      `❌ Мы не можем обеспечить репетицию ${rehearsal.getLabel()}`
    );
  }
}
