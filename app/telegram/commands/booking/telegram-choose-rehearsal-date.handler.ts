import { Context } from 'telegraf';

import {
  GetAvailableRehearsalStateDatesHandler,
} from '../../../handlers/rehearsal-booking/get-available-rehearsal-start-dates.handler';
import { getOneColumnButtons } from '../../../utils/telegramButtonUtilsMarkup';
import { AbstractTelegramCommandHandler } from '../abstract-telegram-command.handler';
import { telegramChooseRehearsalDurationHandler } from './telegram-choose-rehearsal-duraion.handler';

class TelegramChooseRehearsalDateHandler extends AbstractTelegramCommandHandler {
  public readonly command = 'start_booking';
  public readonly textCommand = 'Забронировать репетицию'; // TODO: 
  protected async innerHandle(ctx: Context): Promise<void> {
    const daysToSchedule = new GetAvailableRehearsalStateDatesHandler().handle();

    ctx.reply(
      'Выбери день репетиции',
      getOneColumnButtons(
        daysToSchedule.map(x => ({
          data: telegramChooseRehearsalDurationHandler.createTelegramComandString({ rehearsalDate: x.value }),
          label: x.label
        }))
      )
    );
  }
}

export const telegramChooseRehearsalDateHandler = new TelegramChooseRehearsalDateHandler();