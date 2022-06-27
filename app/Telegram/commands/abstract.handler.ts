import { Context } from 'telegraf';
import { userCommandQueueLocker } from '../user-command-queue-locker.ts/user-command-queue-locker';

export abstract class AbstractTelegramCommandHandler {
    private readonly queue = userCommandQueueLocker;

    // TODO: тут что-то не то с input
    public async handle(ctx: Context, input?: string): Promise<void> {
        const telegramUserId = ctx.from?.id!;
        if (this.queue.isLocked(telegramUserId)) {
            return;
        }

        this.queue.add(telegramUserId);

        try {
            await this.innerHandle(ctx);
        } catch (e) {
            console.log('error while processing handler');
            console.log(e);
        } finally {
            this.queue.remove(telegramUserId);
        }

    }

    protected abstract innerHandle(ctx: Context): Promise<void>;
}