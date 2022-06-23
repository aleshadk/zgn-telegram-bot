import startOfDay from 'date-fns/startOfDay';
import format from 'date-fns/format';
import { addDays, addHours, formatISO, parseISO, setHours, setMinutes } from 'date-fns';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../DAL/User/user.repository';
import { IUser } from '../../DAL/User/user.model';
import { IRehearsalSaveModel } from '../../DAL/Rehearsal/rehearsal.model';
const ruLocale = require('date-fns/locale/ru')

interface IDateValue {
    label: string;
    value: Date;
}

export class BookRehearsalHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;;


    public async handle(data: {userTelegramId: number, rehearsalDate: string, startTime: string, duration: string}): Promise<boolean> {
        const user = await this.getUser(data.userTelegramId);
        if (!user) {
            return false;
        }

        const startTime = new Date(parseInt(data.rehearsalDate));
        const [startHour, startMinute] = data.startTime.split(':');
        startTime.setHours(parseInt(startHour));
        startTime.setMinutes(parseInt(startMinute));

        const endTime = addHours(startTime, parseInt(data.duration));

        const saveModel: IRehearsalSaveModel = {
            createdBy: user,
            endTime,
            startTime,
            isConfirmed: false
        }

        await this.rehearsalRepository.createRehearsal(saveModel);
        console.log(startTime, formatISO(startTime));
        console.log(endTime, formatISO(endTime));
        return true;
    }

    private async getUser(telegramId: number): Promise<IUser | null> {
        try {
            return await this.userRepository.getUser({telegramId}) || null;
        } catch (e) {
            return null;
        }
    }

    private addTo
}