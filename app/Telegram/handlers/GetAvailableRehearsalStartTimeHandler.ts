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

        const rehearsals = await this.rehearsalRepository.getRehearsalsWhereStartTimeBetween(rehearsalDate, maxPossibleRehearsalEndTIme);

        const slots = this.availableRehearsalStartTime.filter(slot => {
            const start = this.getSlotStartTime(rehearsalDate, slot);
            const end = this.getSlotEndTime(start, data.duration);

            const hasConflictRehearsal = rehearsals.some(r => {
                // Если есть репетиция, которая начинается позже начала слота, но при этом не раньше конца слота, то слот недоступен
                // слот      |---------|
                // репетиция       |---
                // При этом нам ок, если репетиция начинается в конец слота
                // слот      |---------|
                // репетиция           |----- // Это ок
                
                if (r.startTime >= start && r.startTime < end) {
                    return true;
                }

                // Если есть репетиция, которая начинается началась раньше слота, но при этом её конец попадает в наш слот, то слот недоступен
                // слот           |---------|
                // репетиция  |-------|

                // слот               |---------|
                // репетиция  |-------| // это ОК

                if (r.endTime > start && r.endTime <= end) {
                    return true;
                }

                return false;
            });

            const isValidSlot = !hasConflictRehearsal;
            return isValidSlot;
        })


        return slots;
    }

    private getSlotStartTime(date: Date, startTime: string): Date {
        const slotStartTime = new Date(date);

        const [startHour, startMinute] = startTime.split(':');
        slotStartTime.setHours(parseInt(startHour));
        slotStartTime.setMinutes(parseInt(startMinute));

        return slotStartTime;
    }

    private getSlotEndTime(slotStartTime: Date, duration: string): Date {
        return addHours(slotStartTime, parseInt(duration));
    }
}