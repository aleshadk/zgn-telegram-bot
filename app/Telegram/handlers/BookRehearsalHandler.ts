import { addHours, formatISO, isPast } from 'date-fns';

import { IRehearsal, IRehearsalSaveModel } from '../../DAL/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { IUser } from '../../DAL/User/user.model';
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
        const startTime = this.calculateStartTime(data.rehearsalDate, data.startTime);
        const endTime = this.calculateEndTime(startTime, data.duration);

        const error =  await this.validate(user, startTime, endTime);

        if (error) {
            return {
                message: error,
                rehearsal: null
            };
        }

        const saveModel: IRehearsalSaveModel = {
            createdBy: user!,
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

    /**
     * @returns error text or undefined if validation has been passed
     */
    private async validate(user: IUser | undefined, rehearsalStart: Date, rehearsalEnd: Date): Promise<string | undefined> {
        if (!user) {
            return 'тебя нет в нашей базе, попробуй написать /start и зарегистрироваться';
        }

        if (isPast(rehearsalStart)) {
            return 'этот слот уже не актуален';
        }

        const hasFreeSlot = await this.hasFreeSlot(rehearsalStart, rehearsalEnd);

        if (!hasFreeSlot) {
            return `этот слот занят`;
        }

        return undefined;
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