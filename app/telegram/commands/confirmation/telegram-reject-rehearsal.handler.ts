import { Context } from 'telegraf';

import { RejectRehearsalHandler } from '../../../handlers/rehearsal-confirmation/reject-rehearsal.handler';
import { AbstractTelegramCommandWithData } from '../abstract-telegram-comand-with-data.handler';

interface IData {
    rehearsalId: string;
}

class TelegramRejectRehearsalHandler extends AbstractTelegramCommandWithData<IData> {
    public readonly suffix = 'reject_rehearsal';

    protected async innerHandle(ctx: Context, input: string): Promise<void> {
        const data = this.parseData(input);
        const message = await new RejectRehearsalHandler().handle(data.rehearsalId, ctx.from?.first_name!);

        if (message) {
            ctx.reply
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

export const rejectRehearsalHandler = new TelegramRejectRehearsalHandler();
