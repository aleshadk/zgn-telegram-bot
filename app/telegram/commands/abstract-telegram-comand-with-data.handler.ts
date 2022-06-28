import { Context } from 'telegraf';

import { AbstractTelegramCommandHandler } from './abstract-telegram-command.handler';

// TODO: придумать адекватное что-то вместо Partial
export abstract class AbstractTelegramCommandWithData<TModel> extends AbstractTelegramCommandHandler {
  public abstract readonly suffix: string;
  public abstract createTelegramComandString(model: TModel): string;
  public abstract parseData(input: string): TModel;

  public async handle(ctx: Context, input: string): Promise<void> {
    super.handle(ctx, input);
  }
}
