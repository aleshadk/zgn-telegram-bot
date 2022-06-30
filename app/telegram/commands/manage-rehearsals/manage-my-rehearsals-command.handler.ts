import { Context } from 'telegraf';
import { GetMyRehearsalsHandler } from '../../../handlers/user/get-my-rehearsals.handler';
import { getOneColumnButtons } from '../../../utils/telegramButtonUtilsMarkup';
import { abandonRehearsalCommand } from './abandon-rehearsal-command.handler';


class ManageMyRehearsalsCommandHandler {
  public readonly textCommand = 'Управлять репетициями';

  public async handle(ctx: Context): Promise<void> {
    const result = await new GetMyRehearsalsHandler().handle(ctx.from?.id!);

    if (result.length === 0) {
      ctx.reply('У тебя нет активных репетиций 😱');
      return;
    }

    ctx.reply(
      'У тебя сейчас есть вот такие репетиции',
      getOneColumnButtons(
        result.map(x => ({
          label: `Отменить ${x.getLabelWithStatus()}`,
          data: abandonRehearsalCommand.createTelegramComandString({ rehearsalId: x.id }),
        }))
      )
    );
  }
}

export const manageMyRehearsalsCommand = new ManageMyRehearsalsCommandHandler();