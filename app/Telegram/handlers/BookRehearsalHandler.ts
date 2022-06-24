import { addHours, formatISO } from 'date-fns';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../DAL/User/user.repository';
import { IRehearsalSaveModel } from '../../DAL/Rehearsal/rehearsal.model';

interface IHandlerResult {
    success: boolean;
    message: string;
}

export class BookRehearsalHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;;


    public async handle(data: {userTelegramId: number, rehearsalDate: string, startTime: string, duration: string}): Promise<IHandlerResult> {
        const user = await this.userRepository.getUser({telegramId: data.userTelegramId});
        if (!user) {
            return {success: false, message: 'Тебя нет в нашей базе, попробуй написать /start и зарегистрироваться'};
        }

        const startTime = this.calculateStartTime(data.rehearsalDate, data.startTime);
        const endTime = this.calculateEndTime(startTime, data.duration);

        const hasFreeSlot = await this.hasFreeSlot(startTime, endTime);

        if (!hasFreeSlot) {
            return {
                success: false,
                message: `Репетиция не забронирована: этот слот занят`
            }
        }

        const saveModel: IRehearsalSaveModel = {
            createdBy: user,
            endTime,
            startTime,
            isConfirmed: false
        }

        await this.rehearsalRepository.createRehearsal(saveModel);
        return {success: true, message: `Успешный успех, репетиция с ${formatISO(startTime)} до ${formatISO(endTime)} забронирована 🤘`};
    }

    private calculateStartTime(rehearsalDate: string, rehearsalStartTime: string): Date {
        const startTime = new Date(parseInt(rehearsalDate));
        const [startHour, startMinute] = rehearsalStartTime.split(':');
        startTime.setHours(parseInt(startHour));
        startTime.setMinutes(parseInt(startMinute));

        return startTime;
    }

    private calculateEndTime(startTime: Date, duration: string;): Date {
        return addHours(startTime, parseInt(duration));
    }

    private async hasFreeSlot(startTime: Date, endTime: Date): Promise<boolean> {
        const rehearsals = await this.rehearsalRepository.getRehearsalsWhereStartTimeBetween(startTime, endTime);
        return rehearsals.length === 0;
    }
}