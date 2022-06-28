import { UserRepository } from '../Domain/User/user.repository';
import { isValidPhone } from '../utils/phoneUtils';
import { telegramBookReheatsalHandler } from './commands/booking/telegram-book-rehearsal.handler';
import { handleTelegramChooseRehearsalDateCommand } from './commands/booking/telegram-choose-rehearsal-date.handler';
import { telegramChooseRehearsalDurationHandler } from './commands/booking/telegram-choose-rehearsal-duraion.handler';
import { telegramChooseRehearsalStartTimeHandler } from './commands/booking/telegram-choose-rehearsal-start-time.handler';
import { confirmRehearsalCommandHandler } from './commands/confirmation/telegram-confirm-rehearsal.handler';
import { rejectRehearsalHandler } from './commands/confirmation/telegram-reject-rehearsal.handler';
import { abandonRehearsalCommand } from './commands/manage-rehearsals/abandon-rehearsal-command.handler';
import { getMyRehearsalsHandler } from './commands/manage-rehearsals/get-my-rehearsals-command.handler';
import { manageMyRehearsalsCommand } from './commands/manage-rehearsals/manage-my-rehearsals-command.handler';
import { handleTelegramStartCommand } from './commands/telegram-start-command.handler';
import { telegramBot } from './telegramBot';

/*
start_booking - забронировать репетицию
get_my_rehearsals - посмотреть свои репетиции
manage_my_rehearsals - управлять своими репетициями
*/
export class TelegramBot { // TODO: rename class
  private readonly userRepository = new UserRepository();
  constructor() {
    telegramBot.start(handleTelegramStartCommand);

    // booking
    telegramBot.command('start_booking', handleTelegramChooseRehearsalDateCommand);
    telegramBot.action(/choose_duration+/, ctx => telegramChooseRehearsalDurationHandler.handle(ctx, ctx.match.input));
    telegramBot.action(/choose_starttime+/, ctx => telegramChooseRehearsalStartTimeHandler.handle(ctx, ctx.match.input));
    telegramBot.action(/book+/, ctx => telegramBookReheatsalHandler.handle(ctx, ctx.match.input));

    // confirmation
    telegramBot.action(/confirm_rehearsal+/, async ctx => confirmRehearsalCommandHandler.handle(ctx, ctx.match.input));
    telegramBot.action(/reject_rehearsal+/, async ctx => rejectRehearsalHandler.handle(ctx, ctx.match.input));

    // manage
    telegramBot.command('get_my_rehearsals', async ctx => getMyRehearsalsHandler.handle(ctx));
    telegramBot.command('manage_my_rehearsals', ctx => manageMyRehearsalsCommand.handle(ctx));
    telegramBot.action(/abandon+/, ctx => abandonRehearsalCommand.handle(ctx, ctx.match.input));


    telegramBot.on('text', async (ctx) => {
      const user = await this.userRepository.getUser({ telegramId: ctx.from.id });

      if (!user?.phone) {
        if (isValidPhone(ctx.message.text)) {
          await this.userRepository.update({ telegramId: ctx.from.id, phone: ctx.message.text });
          ctx.reply(`${ctx.from.first_name} всё настроено!`);
          return;
        }

        ctx.reply('Сначала нужен твой телефон, чтобы быть на связи если что-то пойдёт не так');
        return;
      }

      telegramBot.telegram.sendSticker(ctx.chat.id, 'CAACAgIAAxkBAAEFJbRiuhAh0LD_sXRlwF0LC75QF8yuCwACqxQAAlZj0Uv2kPeKprHrhSkE');
    });

    telegramBot.launch();
  }
}