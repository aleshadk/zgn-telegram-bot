import { IRehearsal } from '../../Domain/Rehearsal/rehearsal.model';
import { UserRepository } from '../../Domain/User/user.repository';
import { confirmRehearsalCommandHandler } from '../../telegram/commands/confirmation/telegram-confirm-rehearsal.handler';
import { rejectRehearsalHandler } from '../../telegram/commands/confirmation/telegram-reject-rehearsal.handler';
import { telegramBot } from '../../telegram/telegram-bot';
import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';
import { getTwoColumnsButtons } from '../../utils/telegramButtonUtilsMarkup';


export class SendRehearsalConfirmationMessageToAdminsHandler {
  private readonly userRepository = new UserRepository;

  public async handle(rehearsal: IRehearsal): Promise<void> {
    const admins = await this.userRepository.getAdminUsers();
    const message = this.getMessage(rehearsal);

    admins.forEach(x => {
      telegramBot.telegram.sendMessage(
        x.telegramChatId,
        message,
        getTwoColumnsButtons([
          { label: '✅ Подтвердить', data: confirmRehearsalCommandHandler.createTelegramComandString({ rehearsalId: rehearsal.id }) },
          { label: '❌ Отклонить', data: rejectRehearsalHandler.createTelegramComandString({ rehearsalId: rehearsal.id }) },
        ])
      );
    });
  }

  private getMessage(rehearsal: IRehearsal): string {
    const userName = rehearsal.createdBy.firstName;
    const phone = rehearsal.createdBy.phone;
    const rehearsalData = formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime);

    return `${userName} (тел. ${phone}) хочет забронировать репетицию ${rehearsalData}`;
  }
}
