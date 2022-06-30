import { Context } from 'telegraf';

import { GetMyRehearsalsHandler } from '../../../handlers/user/get-my-rehearsals.handler';
import { AbstractTelegramCommandHandler } from '../abstract-telegram-command.handler';


class TelegramGetMyRehearsalsHandler extends AbstractTelegramCommandHandler {
  public textCommand = 'Посмотреть мои репетиции';

  protected async innerHandle(ctx: Context): Promise<void> {
    const result = await new GetMyRehearsalsHandler().handle(ctx.from?.id!);

    if (result.length === 0) {
      ctx.reply('У тебя нет активных репетиций 😱');
      return;
    }

    const response = `У тебя есть вот такие репетиции: \n\n${result.map(x => x.label).join('\n')}`;

    ctx.reply(response);
  }
}

export const telegramGetMyRehearsalsHandler = new TelegramGetMyRehearsalsHandler();