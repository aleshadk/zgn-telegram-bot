import { Markup } from 'telegraf';

import { IRehearsal } from '../../Domain/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../Domain/User/user.repository';
import { telegramBot } from '../../telegram/telegramBot';
import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';


export class SendRehearsalConfirmationMessageToAdminsHandler {
    private readonly userRepository = new UserRepository;

    public async handle(rehearsal: IRehearsal ): Promise<void> {
        const admins = await this.userRepository.getAdminUsers();

        admins.forEach(x => {
            telegramBot.telegram.sendMessage(
                x.telegramChatId,
                this.getMessage(rehearsal),
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                Markup.button.callback('✅ Подтвердить', `rehearsal_confirmed__${rehearsal.id}`),
                                Markup.button.callback('❌ Отклонить', `rehearsal_rejected__${rehearsal.id}`),
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
