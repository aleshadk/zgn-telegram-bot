import { model } from 'mongoose';
import { Context } from 'telegraf';

import { BookRehearsalHandler } from '../../handlers/rehearsal-booking/book-rehearsal.handler';
import {
    SendRehearsalConfirmationMessageToAdminsHandler,
} from '../../handlers/rehearsal-confirmation/send-rehearsal-confirmation-message-to-admins.handler';
import { IChooseStartTimeCommandModel } from '../telegram.models';
import { AbstractTelegramAction } from './abstract-telegram-action.handler';

class TelegramRehearsalSlotChosenHandler extends AbstractTelegramAction<IChooseStartTimeCommandModel> {
    public readonly suffix = 'slotchosen';

    public async handle(ctx: Context, input: string): Promise<void> {
        const data = this.parseData(input);
        const result = await new BookRehearsalHandler().handle({
            ...data,
            userTelegramId: ctx.from?.id!
        });

        ctx.reply(result.message);
        if (result.rehearsal) {
            await new SendRehearsalConfirmationMessageToAdminsHandler().handle(result.rehearsal);
        }
    }

    public createTelegramComandString(model: IChooseStartTimeCommandModel): string {
        return [
            this.suffix,
            model.rehearsalDate.getTime(),
            model.rehearsalDuration,
            model.rehearsalStartTime
        ].join('__');
    }

    public parseData(input: string): IChooseStartTimeCommandModel {
        const [_, rehearsalDate, rehearsalDuration, rehearsalStartTime] = input.split('__');
        return {
            rehearsalDate: new Date(parseInt(rehearsalDate)),
            rehearsalDuration: parseInt(rehearsalDuration),
            rehearsalStartTime,
        }
    }
}

export const telegramRehearsalSlotChosenHandler = new TelegramRehearsalSlotChosenHandler();