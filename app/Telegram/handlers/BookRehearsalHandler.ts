import { addHours, formatISO } from 'date-fns';

import { IRehearsal, IRehearsalSaveModel } from '../../DAL/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../DAL/User/user.repository';
import { formatRehearsalDateWithDuration } from '../../Services/DateUtils';

interface IHandlerResult {
    message: string;
    rehearsal: IRehearsal | null;
}

export class BookRehearsalHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;;


    public async handle(data: {userTelegramId: number, rehearsalDate: string, startTime: string, duration: string}): Promise<IHandlerResult> {
        const user = await this.userRepository.getUser({telegramId: data.userTelegramId});
        if (!user) {
            return {
                message: 'Тебя нет в нашей базе, попробуй написать /start и зарегистрироваться',
                rehearsal: null,
            };
        }

        const startTime = this.calculateStartTime(data.rehearsalDate, data.startTime);
        const endTime = this.calculateEndTime(startTime, data.duration);

        const hasFreeSlot = await this.hasFreeSlot(startTime, endTime);

        if (!hasFreeSlot) {
            return {
                message: `Репетиция не забронирована: этот слот занят`,
                rehearsal: null
            }
        }

        const saveModel: IRehearsalSaveModel = {
            createdBy: user,
            endTime,
            startTime,
            isConfirmed: false
        }

        const rehearsal = await this.rehearsalRepository.createRehearsal(saveModel);
        return {
            rehearsal,
            message: `Успешный успех, ждём от админов подтверждения репетиции ${formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime)} 🤘`
        };
    }

    private calculateStartTime(rehearsalDate: string, rehearsalStartTime: string): Date {
        const startTime = new Date(parseInt(rehearsalDate));
        const [startHour, startMinute] = rehearsalStartTime.split(':');
        startTime.setHours(parseInt(startHour));
        startTime.setMinutes(parseInt(startMinute));

        return startTime;
    }

    private calculateEndTime(startTime: Date, duration: string): Date {
        return addHours(startTime, parseInt(duration));
    }

    private async hasFreeSlot(startTime: Date, endTime: Date): Promise<boolean> {
        const rehearsals = await this.rehearsalRepository.getRehearsalsWhereStartTimeBetween(startTime, endTime);
        return rehearsals.length === 0;
    }
}