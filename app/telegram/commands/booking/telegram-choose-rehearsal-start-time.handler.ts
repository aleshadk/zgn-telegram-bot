import { Context } from 'telegraf';

import {
  GetAvailableRehearsalStartTimeSlotsHandler,
} from '../../../handlers/rehearsal-booking/get-available-rehearsal-start-time-slots.handler';
import { getOneColumnButtons } from '../../../utils/telegramButtonUtilsMarkup';
import { AbstractTelegramCommandWithData } from '../abstract-telegram-comand-with-data.handler';
import { IChooseDurationCommandModel } from './booking.model';
import { telegramBookReheatsalHandler } from './telegram-book-rehearsal.handler';

class TelegramChooseRehearsalStartTimeHanlder extends AbstractTelegramCommandWithData<IChooseDurationCommandModel> {
  public readonly suffix = 'choose_starttime';

  protected async innerHandle(ctx: Context, input: string): Promise<void> {
    const data = this.parseData(input);

    const slots = await new GetAvailableRehearsalStartTimeSlotsHandler().handle(data);

    if (slots.length === 0) {
      ctx.reply('В этот день нет подходящих по длительности слотов 😖');
      return;
    }

    ctx.reply(
      'Выбери время начала репетиции',
      getOneColumnButtons(
        slots.map(x => ({
          label: x,
          data: telegramBookReheatsalHandler.createTelegramCommandString({
            ...data,
            rehearsalStartTime: x,
          }),
        }))
      )
    );
  }

  public createTelegramCommandString(model: IChooseDurationCommandModel): string {
    return [
      this.suffix,
      model.rehearsalDate.getTime(),
      model.rehearsalDuration
    ].join('__');
  }

  public parseData(input: string): IChooseDurationCommandModel {
    const [_, rehearsalDate, rehearsalDuration] = input.split('__');
    return {
      rehearsalDate: new Date(parseInt(rehearsalDate)),
      rehearsalDuration: parseInt(rehearsalDuration)
    }
  }
}

export const telegramChooseRehearsalStartTimeHandler = new TelegramChooseRehearsalStartTimeHanlder();