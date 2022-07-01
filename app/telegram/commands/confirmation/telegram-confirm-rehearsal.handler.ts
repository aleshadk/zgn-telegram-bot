import { Context } from 'telegraf';

import { ConfirmRehearsalHandler } from '../../../handlers/rehearsal-confirmation/confirm-rehearsal.handler';
import { AbstractTelegramCommandWithData } from '../abstract-telegram-comand-with-data.handler';

interface IData {
  rehearsalId: string;
}

class TelegramConfirmRehearsalHandler extends AbstractTelegramCommandWithData<IData> {
  public readonly suffix = 'confirm_rehearsal';

  protected async innerHandle(ctx: Context, input: string): Promise<void> {
    const data = this.parseData(input);
    const message = await new ConfirmRehearsalHandler().handle(data.rehearsalId, ctx.from?.first_name!);

    if (message) {
      ctx.reply(message);
    }
  }

  public createTelegramCommandString(model: IData): string {
    return [
      this.suffix,
      model.rehearsalId
    ].join('__');
  }

  public parseData(input: string): IData {
    const [_, rehearsalId] = input.split('__');
    return {
      rehearsalId,
    }
  }
}

export const confirmRehearsalCommandHandler = new TelegramConfirmRehearsalHandler();
