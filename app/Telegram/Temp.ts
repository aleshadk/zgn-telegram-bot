import { Context } from 'telegraf';

import { UserRepository } from '../Domain/User/user.repository';
import { ConfirmRehearsalHandler } from '../handlers/rehearsal-confirmation/confirm-rehearsal.handler';
import { RejectRehearsalHandler } from '../handlers/rehearsal-confirmation/reject-rehearsal.handler';
import { GetMyRehearsalsHandler } from '../handlers/user/get-my-rehearsals.handler';
import { isValidPhone } from '../utils/phoneUtils';
import { telegramRehearsalDateChosenHandler } from './commands/telegram-rehearsal-date-chosen.handler';
import { telegramRehearsalDurationChosenHandler } from './commands/telegram-rehearsal-duration-chosen.handler';
import { telegramRehearsalSlotChosenHandler } from './commands/telegram-rehearsal-slot-chosen.handler';
import { handleTelegramStartBookingCommand } from './commands/telegram-start-booking-command.handler';
import { handleTelegramStartCommand } from './commands/telegram-start-command.handler';
import { telegramBot } from './telegramBot';

export class TelegramBot { // TODO: rename class
    private readonly userRepository = new UserRepository();
    constructor() {
        telegramBot.start(handleTelegramStartCommand);

        // booking
        telegramBot.command('start_booking', handleTelegramStartBookingCommand);
        telegramBot.action(/datechosen+/, ctx => telegramRehearsalDateChosenHandler.handle(ctx, ctx.match.input));
        telegramBot.action(/durationchosen+/, ctx => telegramRehearsalDurationChosenHandler.handle(ctx, ctx.match.input));
        telegramBot.action(/slotchosen+/, ctx => telegramRehearsalSlotChosenHandler.handle(ctx, ctx.match.input));

        // confirmation
        telegramBot.action(/rehearsal_confirmed+/, async ctx => {
            const rehearsalId = ctx.match.input.replace('rehearsal_confirmed__', '');
            new ConfirmRehearsalHandler().handle(ctx, telegramBot, rehearsalId);
        });

        telegramBot.action(/rehearsal_rejected+/, async ctx => {
            const rehearsalId = ctx.match.input.replace('rehearsal_rejected__', '');
            new RejectRehearsalHandler().handle(ctx, telegramBot, rehearsalId);
        });

        telegramBot.command('get_my_rehearsals', async ctx => {
            const result = await new GetMyRehearsalsHandler().handle(ctx.from?.id!);

            if (result.length === 0) {
                ctx.reply('У тебя нет активных репетиций 😱');
                return;
            }

            const response = `У тебя есть вот такие репетиции: \n\n${result.map(x => x.label).join('\n')}`;

            ctx.reply(response);
        });

        telegramBot.on('text', async (ctx) => {
            const user = await this.userRepository.getUser({ telegramId: ctx.from.id });

            if (!user?.phone) {
                if (isValidPhone(ctx.message.text)) {
                    await this.userRepository.update({ telegramId: ctx.from.id, phone: ctx.message.text });
                    ctx.reply(`${ctx.from.first_name} всё настроено!`);
                    return;
                }

                this.handleMessageFromUserWithoutPhone(ctx);
                return;
            }

            ctx.reply(`${ctx.from.first_name} всё настроено!`);
        });

        telegramBot.launch();
    }

    private handleMessageFromUserWithoutPhone(ctx: Context): void {
        ctx.telegram.sendMessage(ctx.message!.chat.id, `${ctx.from?.first_name}, чтобы продолжить работу нужно ввести свой телефон`);
    }
}