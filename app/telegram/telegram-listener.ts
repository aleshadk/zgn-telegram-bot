import { Context, Markup } from 'telegraf';

import { telegramBookReheatsalHandler } from './commands/booking/telegram-book-rehearsal.handler';
import { telegramChooseRehearsalDateHandler } from './commands/booking/telegram-choose-rehearsal-date.handler';
import { telegramChooseRehearsalDurationHandler } from './commands/booking/telegram-choose-rehearsal-duraion.handler';
import { telegramChooseRehearsalStartTimeHandler } from './commands/booking/telegram-choose-rehearsal-start-time.handler';
import { confirmRehearsalCommandHandler } from './commands/confirmation/telegram-confirm-rehearsal.handler';
import { rejectRehearsalHandler } from './commands/confirmation/telegram-reject-rehearsal.handler';
import { abandonRehearsalCommand } from './commands/manage-rehearsals/abandon-rehearsal-command.handler';
import { telegramGetMyRehearsalsHandler } from './commands/manage-rehearsals/get-my-rehearsals-command.handler';
import { manageMyRehearsalsCommand } from './commands/manage-rehearsals/manage-my-rehearsals-command.handler';
import { handleTelegramContactReceived } from './commands/user/telegram-register-user.handler';
import { telegramBot } from './telegram-bot';

/*
start_booking - забронировать репетицию
get_my_rehearsals - посмотреть свои репетиции
manage_my_rehearsals - управлять своими репетициями
*/
export class TelegramListener {
  constructor() {
    telegramBot.use((ctx, next) => {
      console.log('middle where', ctx.message);
      return next();
    });

    // user
    telegramBot.start(async ctx => this.onStart(ctx));
    telegramBot.on('contact', async ctx => handleTelegramContactReceived(ctx, ctx.update.message.contact));

    // booking
    telegramBot.command(telegramChooseRehearsalDateHandler.command, async ctx => telegramChooseRehearsalDateHandler.handle(ctx));
    telegramBot.action(/choose_duration+/, async ctx => telegramChooseRehearsalDurationHandler.handle(ctx, ctx.match.input));
    telegramBot.action(/choose_starttime+/, async ctx => telegramChooseRehearsalStartTimeHandler.handle(ctx, ctx.match.input));
    telegramBot.action(/book+/, async ctx => telegramBookReheatsalHandler.handle(ctx, ctx.match.input));

    // confirmation
    telegramBot.action(/confirm_rehearsal+/, async ctx => confirmRehearsalCommandHandler.handle(ctx, ctx.match.input));
    telegramBot.action(/reject_rehearsal+/, async ctx => rejectRehearsalHandler.handle(ctx, ctx.match.input));

    // manage
    telegramBot.command('get_my_rehearsals', async ctx => telegramGetMyRehearsalsHandler.handle(ctx));
    telegramBot.command('manage_my_rehearsals', async ctx => manageMyRehearsalsCommand.handle(ctx));
    telegramBot.action(/abandon+/, async ctx => abandonRehearsalCommand.handle(ctx, ctx.match.input));

    // default
    telegramBot.on('text', async ctx => this.onMessage(ctx, ctx.message.text));

    telegramBot.launch();
  }

  private onStart(ctx: Context): void {
    // TODO: нужно проверку на то, что пользователь зарегистрирован

    ctx.reply(
      'Отправь нам свой контакт, чтобы можно с тобой было быстро связаться',
      Markup.keyboard([
        Markup.button.contactRequest('Поделиться своим контактом'),
      ]).resize()
    );
  }

  private onMessage(ctx: Context, message: string): void {
    switch (message) {
      case telegramChooseRehearsalDateHandler.textCommand:
        telegramChooseRehearsalDateHandler.handle(ctx);
        return;
      case telegramGetMyRehearsalsHandler.textCommand:
        telegramGetMyRehearsalsHandler.handle(ctx);
        return;
      case manageMyRehearsalsCommand.textCommand:
        manageMyRehearsalsCommand.handle(ctx);
        return;
      default:
        telegramBot.telegram.sendSticker(ctx.chat!.id, 'CAACAgIAAxkBAAEFJbRiuhAh0LD_sXRlwF0LC75QF8yuCwACqxQAAlZj0Uv2kPeKprHrhSkE');
    }
  }
}