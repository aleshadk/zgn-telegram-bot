import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { RehearsalFull } from '../../Domain/Rehearsal/rehearsal.entity';
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
    const buttons = this.getButtons(rehearsal);

    admins.forEach(x => {
      telegramBot.telegram.sendMessage(
        x.telegramChatId,
        message,
        buttons,
      );
    });
  }

  private getButtons(rehearsal: RehearsalFull): ExtraReplyMessage {
    return getTwoColumnsButtons([
      { label: '✅ Подтвердить', data: confirmRehearsalCommandHandler.createTelegramCommandString({ rehearsalId: rehearsal.id }) },
      { label: '❌ Отклонить', data: rejectRehearsalHandler.createTelegramCommandString({ rehearsalId: rehearsal.id }) },
    ])
  }

  private getMessage(rehearsal: RehearsalFull): string {
    const userName = rehearsal.createdBy.firstName;
    const phone = rehearsal.createdBy.phone;

    return `${userName} (тел. ${phone}) хочет забронировать репетицию ${rehearsal.getLabel()}`;
  }
}
