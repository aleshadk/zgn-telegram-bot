import { Context } from 'telegraf';
import { GetAvailableRehearsalStateDatesHandler } from '../../../handlers/rehearsal-booking/get-available-rehearsal-start-dates.handler';
import { getOneColumnButtons } from '../../../utils/telegramButtonUtilsMarkup';

import { telegramRehearsalDateChosenHandler } from './telegram-rehearsal-date-chosen.handler';

class TelegramStartBookingCommandHandler {
    public async handle(ctx: Context): Promise<void> {
        const daysToSchedule = new GetAvailableRehearsalStateDatesHandler().handle();

        ctx.reply(
            'Выбери день репетиции', 
            getOneColumnButtons(
                daysToSchedule.map(x => ({
                    data: telegramRehearsalDateChosenHandler.createTelegramComandString({rehearsalDate: x.value}),
                    label: x.label
                }))
            )
        );
    }
}

export function handleTelegramStartBookingCommand(ctx: Context): Promise<void> {
    return new TelegramStartBookingCommandHandler().handle(ctx);
}