import { Context } from 'telegraf';

import {
    GetAvailableRehearsalDuractionHandler,
} from '../../handlers/rehearsal-booking/get-available-rehearsal-duration.handler';
import { GetAvailableRehearsalStartTimeSlotsHandler } from '../../handlers/rehearsal-booking/get-available-rehearsal-start-time-slots.handler';
import { getOneColumnButtons } from '../../utils/telegramButtonUtilsMarkup';
import { IChooseDurationCommandModel } from '../telegram.models';
import { AbstractTelegramAction } from './abstract-telegram-action.handler';
import { telegramRehearsalSlotChosenHandler } from './telegram-rehearsal-slot-chosen.handler';

class TelegramRehearsalDurationChosenHandler extends AbstractTelegramAction<IChooseDurationCommandModel> {
    public readonly suffix = 'durationchosen';

    public async handle(ctx: Context, input: string): Promise<void> {
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
                    data: telegramRehearsalSlotChosenHandler.createTelegramComandString({
                        ...data,
                        rehearsalStartTime: x,
                    }),
                }))
            )
        );
    }

    public createTelegramComandString(model: IChooseDurationCommandModel): string {
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

export const telegramRehearsalDurationChosenHandler = new TelegramRehearsalDurationChosenHandler();