import { Context } from 'telegraf';

import {
    GetAvailableRehearsalDuractionHandler,
} from '../../../handlers/rehearsal-booking/get-available-rehearsal-duration.handler';
import { getOneColumnButtons } from '../../../utils/telegramButtonUtilsMarkup';
import { AbstractTelegramCommandWithData } from '../abstract-telegram-comand-with-data.handler';
import { IChooseDateCommandModel } from './booking.model';
import { telegramChooseRehearsalStartTimeHandler } from './telegram-choose-rehearsal-start-time.handler';

class TelegramChooseRehearsalDurationHandler extends AbstractTelegramCommandWithData<IChooseDateCommandModel> {
    public readonly suffix = 'choose_duration';

    protected innerHandle(ctx: Context, input: string): Promise<void> {
        return new Promise(async resolve => {
            const data = this.parseData(input);
            const durations = new GetAvailableRehearsalDuractionHandler().handle();

            setTimeout(() => {
                ctx.reply(
                    'Выбери длительность репетиции', 
                    getOneColumnButtons(
                        durations.map(x => ({
                            label: `${x} ч.`,
                            data: telegramChooseRehearsalStartTimeHandler.createTelegramComandString({
                                ...data,
                                rehearsalDuration: x
                            }),
                        }))
                    )
                );

                resolve();
            }, 5000)
        })


     
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

export const telegramChooseRehearsalDurationHandler = new TelegramChooseRehearsalDurationHandler();