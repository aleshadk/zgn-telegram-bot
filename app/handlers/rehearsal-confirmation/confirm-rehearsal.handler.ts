import { RehearsalFull } from '../../Domain/Rehearsal/rehearsal.entity';
import { RehearsalStatus } from '../../Domain/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { telegramBot } from '../../telegram/telegram-bot';
import { NotifyAdminAboutRehearsalStatusChangeHandler } from './notify-admin-about-rehearsal-status-change.handler';

export class ConfirmRehearsalHandler {
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

    if (rehearsal.status !== RehearsalStatus.Draft) {
      let message = '';
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

      return message;
    }

    const updatedRehearsal = await this.rehearsalRepository.changeRehearsalStatus(rehearsalId, RehearsalStatus.Confirmed);

    if (!updatedRehearsal) {
      // TODO: может добавить логи?
      return 'Что-то сломалось';
    }

    this.notifyRehearsalOwner(rehearsal);
    this.notifyAdmins(rehearsal, currentUserTelegramName);
  }

  private async notifyAdmins(
    rehearsal: RehearsalFull,
    confirmedBy: string,
  ): Promise<void> {
    const message = `✅ Репетицию ${rehearsal.createdBy.firstName} (тел. ${rehearsal.createdBy.phone}) ${rehearsal.getLabel()} подтвердил ${confirmedBy}`;
    void new NotifyAdminAboutRehearsalStatusChangeHandler().handle(message);
  }

  private notifyRehearsalOwner(rehearsal: RehearsalFull): void {
    telegramBot.telegram.sendMessage(
      rehearsal.createdBy.telegramChatId,
      `Твоя репетиция ${rehearsal.getLabel()} подтверждена!`
    );
  }
}
