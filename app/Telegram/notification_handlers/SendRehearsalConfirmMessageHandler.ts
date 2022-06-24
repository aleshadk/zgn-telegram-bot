import { Context, Markup, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

import { IRehearsal } from '../../DAL/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../DAL/User/user.repository';
import { formatRehearsalDateWithDuration } from '../../Services/DateUtils';


export class SendRehearsalConfirmMessageHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;

    public async handle(bot: Telegraf<Context<Update>>, rehearsal: IRehearsal ): Promise<void> {
        const admins = await this.userRepository.getAdminUsers();

        admins.forEach(x => {
            bot.telegram.sendMessage(
                x.telegramChatId,
                this.getMessage(rehearsal),
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                Markup.button.callback('✅ Подтвердить', `rehearsal_confirmed__${rehearsal.id}`),
                                Markup.button.callback('❌ Не подтвердить', `rehearsal_rejected__${rehearsal.id}`),
                            ]
                        ]
                    }
                }
            )
        })
    }

    private getMessage(rehearsal: IRehearsal): string {
        const userName = rehearsal.createdBy.firstName;
        const phone = rehearsal.createdBy.phone;
        const rehearsalData = formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime);

        return `${userName} (тел. ${phone}) хочет забронировать репетицию ${rehearsalData}`;
    }

}
