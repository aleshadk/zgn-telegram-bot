import { Context, Markup } from 'telegraf';
import { Contact } from 'telegraf/typings/core/types/typegram';

import { UserRepository } from '../../../Domain/User/user.repository';
import { telegramBot } from '../../telegram-bot';
import { telegramChooseRehearsalDateHandler } from '../booking/telegram-choose-rehearsal-date.handler';
import { telegramGetMyRehearsalsHandler } from '../manage-rehearsals/get-my-rehearsals-command.handler';

class TelegramContactReceivedHandler {
  private readonly userRepository = new UserRepository;

  public async handle(ctx: Context, contact: Contact): Promise<void> {
    const userTelegramId = ctx.message?.from.id || undefined;

    if (!userTelegramId || !contact.user_id || !ctx.message?.chat.id) {
      ctx.reply('Что-то пошло не так');
      return;
    }

    const user = await this.userRepository.getUser({ telegramId: userTelegramId });

    if (user) {
      this.replySuccess(ctx);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      telegramBot.telegram.sendSticker(ctx.chat!.id, 'CAACAgIAAxkBAAEFJbRiuhAh0LD_sXRlwF0LC75QF8yuCwACqxQAAlZj0Uv2kPeKprHrhSkE');
      return;
    }

    if (userTelegramId !== contact.user_id) {
      ctx.reply('Это же не твой контакт');
      return;
    }

    await this.saveUser(contact, ctx.from?.username || 'НЕИЗВЕСТНО', ctx.message.chat.id);
    this.replySuccess(ctx);
  }

  private async saveUser(contact: Contact, telegramUserName: string, telegramChatId: number): Promise<void> {
    await this.userRepository.createUser({
      firstName: contact.first_name,
      isAdmin: false,
      lastName: contact.last_name || undefined,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      telegramId: contact.user_id!,
      telegramName: telegramUserName,
      telegramChatId: telegramChatId,
      phone: contact.phone_number,
    });
  }

  private replySuccess(ctx: Context): void {
    ctx.reply(
      'У тебя всё настроено 🤟\nТеперь можно бронировать репетицию',
      Markup.keyboard([
        Markup.button.text(telegramChooseRehearsalDateHandler.textCommand),
        Markup.button.text(telegramGetMyRehearsalsHandler.textCommand)
        
        // TODO:
      ]).resize()
    );
  }
}

export function handleTelegramContactReceived(ctx: Context, contact: Contact): Promise<void> {
  return new TelegramContactReceivedHandler().handle(ctx, contact);
}