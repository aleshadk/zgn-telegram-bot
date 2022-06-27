import { Context } from 'telegraf';
import { GetMyRehearsalsHandler } from '../../../handlers/user/get-my-rehearsals.handler';
import { getOneColumnButtons } from '../../../utils/telegramButtonUtilsMarkup';
import { AbstractTelegramCommandHandler } from '../abstract-telegram-command.handler';
import { abandonRehearsalCommand } from './abandon-rehearsal-command.handler';


class GetMyRehearsalsCommandHandler extends AbstractTelegramCommandHandler {
    protected async innerHandle(ctx: Context): Promise<void> {
        const result = await new GetMyRehearsalsHandler().handle(ctx.from?.id!);

        if (result.length === 0) {
            ctx.reply('У тебя нет активных репетиций 😱');
            return;
        }

        const response = `У тебя есть вот такие репетиции: \n\n${result.map(x => x.label).join('\n')}`;

        ctx.reply(response);
    }
}

export const getMyRehearsalsHandler = new GetMyRehearsalsCommandHandler();