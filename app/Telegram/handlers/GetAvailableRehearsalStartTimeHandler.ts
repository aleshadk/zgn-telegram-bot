import { add, addDays, addHours, formatISO, nextDay } from 'date-fns';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';

const ruLocale = require('date-fns/locale/ru')

export class GetAvailableRehearsalStartTimeHandler {
    private rehearsalRepository = new RehearsalRepository(); 

    private readonly availableRehearsalStartTime = [
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
    ];

    public async handle(data: {rehearsalDate: string, duration: string}): Promise<string[]> {
        const rehearsalDate = new Date(parseInt(data.rehearsalDate));
        const nextDayAfterRehearsalStart = addDays(rehearsalDate, 1);
        const maxPossibleRehearsalEndTIme = addHours(nextDayAfterRehearsalStart, parseInt(data.duration) - 1);

        const rehearsals = this.rehearsalRepository.getRehearsalBetweenDates(rehearsalDate, maxPossibleRehearsalEndTIme);

        // console.log('ищем слоты между', formatISO(rehearsalDate), formatISO(maxPossibleRehearsalEndTIme));

        

        return this.availableRehearsalStartTime;
    }
}