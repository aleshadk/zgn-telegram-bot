import { Context } from 'telegraf';

import {
    GetAvailableRehearsalDuractionHandler,
} from '../../handlers/rehearsal-booking/get-available-rehearsal-duration.handler';
import { getOneColumnButtons } from '../../utils/telegramButtonUtilsMarkup';
import { IChooseDateCommandModel } from '../telegram.models';
import { AbstractTelegramAction } from './abstract-telegram-action.handler';
import { telegramRehearsalDurationChosenHandler } from './telegram-rehearsal-duration-chosen.handler';

class TelegramRehearsalDateChosenHandler extends AbstractTelegramAction<IChooseDateCommandModel> {
    public readonly suffix = 'datechosen';

    public async handle(ctx: Context, input: string): Promise<void> {
        const data = this.parseData(input);
        const durations = new GetAvailableRehearsalDuractionHandler().handle();

        ctx.reply(
            'Выбери длительность репетиции', 
            getOneColumnButtons(
                durations.map(x => ({
                    label: `${x} ч.`,
                    data: telegramRehearsalDurationChosenHandler.createTelegramComandString({
                        ...data,
                        rehearsalDuration: x
                    }),
                }))
            )
        );
    }

    public createTelegramComandString(model: IChooseDateCommandModel): string {
        return [
            this.suffix,
            model.rehearsalDate.getTime()
        ].join('__');
    }

    public parseData(input: string): IChooseDateCommandModel {
        const [_, rehearsalDate] = input.split('__');
        return {
            rehearsalDate: new Date(parseInt(rehearsalDate))
        }
    }
}

export const telegramRehearsalDateChosenHandler = new TelegramRehearsalDateChosenHandler();