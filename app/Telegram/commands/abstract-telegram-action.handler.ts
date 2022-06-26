import { Context } from 'telegraf';
import { IChooseStartTimeCommandModel } from '../telegram.models';

// TODO: придумать адекватное что-то вместо Partial
export abstract class AbstractTelegramAction<TModel extends Partial<IChooseStartTimeCommandModel>> {
    public abstract readonly suffix: string;

    public abstract handle(ctx: Context, input: string): Promise<void>;
    public abstract createTelegramComandString(model: TModel): string;
    public abstract parseData(input: string): TModel;
}
