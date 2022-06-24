import { format, formatDistanceStrict, formatISO, isToday, isTomorrow } from 'date-fns';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../DAL/User/user.repository';

const ruLocale = require('date-fns/locale/ru')


interface IGetMyRehearsalsResponse {
    label: string;
    rehearsalId: string;
}

export class GetMyRehearsalsHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;;


    public async handle(userTelegramId: number): Promise<IGetMyRehearsalsResponse[]> {
        const user = await this.userRepository.getUser({telegramId: userTelegramId});
        if (!user) {
            return [];
        }

        const rehearsals =  await this.rehearsalRepository.getUserActiveRehearsals(user);

        return rehearsals.map(x => {
            const duration = formatDistanceStrict(x.startTime, x.endTime, {
                unit: 'hour',
                locale: ruLocale
              });

            return {
                label: `${this.formatRehearsalDate(x.startTime)} на ${duration}`,
                rehearsalId: x.id,
            }
        });
    }

    private formatRehearsalDate(date: Date): string {
        if (isToday(date)) {
            return `Сегодня в ${format(date, 'HH:mm', {locale: ruLocale})}`;
        }

        if (isTomorrow(date)) {
            return `Завтра в ${format(date, 'HH:mm', {locale: ruLocale})}`;
        }

        return format(
            new Date(),
            'd MMMM HH:mm',
            { locale: ruLocale }
          )
    }
}