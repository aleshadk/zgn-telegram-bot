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

    const markup = [
      'Твои репетиции:\n\n',
      ...result.map(x => `    <b>${x.getLabelWithStatus()}</b>\n`)
    ];

    ctx.replyWithHTML(markup.join(''));
  }
}

export const telegramGetMyRehearsalsHandler = new TelegramGetMyRehearsalsHandler();