import { RehearsalFull } from '../../Domain/Rehearsal/rehearsal.entity';
import { IUser } from '../../Domain/User/user.model';
import { UserRepository } from '../../Domain/User/user.repository';
import { confirmRehearsalCommandHandler } from '../../telegram/commands/confirmation/telegram-confirm-rehearsal.handler';
import { rejectRehearsalHandler } from '../../telegram/commands/confirmation/telegram-reject-rehearsal.handler';
import { telegramBot } from '../../telegram/telegram-bot';
import { getTwoColumnsButtons } from '../../utils/telegramButtonUtilsMarkup';


export class SendRehearsalConfirmationMessageToAdminsHandler {
  private readonly userRepository = new UserRepository;

  public async handle(rehearsal: RehearsalFull): Promise<void> {
    const admins = await this.userRepository.getAdminUsers();
    const message = this.getMessage(rehearsal);

    admins.forEach(x => this.notify(x, message));
  }

  private notify(user: IUser, message: string): void {
    telegramBot.telegram.sendMessage(
      user.telegramChatId,
      message,
      getTwoColumnsButtons([
        { label: '✅ Подтвердить', data: confirmRehearsalCommandHandler.createTelegramCommandString({ rehearsalId: rehearsal.id }) },
        { label: '❌ Отклонить', data: rejectRehearsalHandler.createTelegramCommandString({ rehearsalId: rehearsal.id }) },
      ])
    );
  }

  private getMessage(rehearsal: RehearsalFull): string {
    const userName = rehearsal.createdBy.firstName;
    const phone = rehearsal.createdBy.phone;

    return `${userName} (тел. ${phone}) хочет забронировать репетицию ${rehearsal.getLabel()}`;
  }
}
