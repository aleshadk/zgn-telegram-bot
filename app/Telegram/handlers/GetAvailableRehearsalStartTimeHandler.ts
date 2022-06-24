import { add, addDays, addHours, formatISO, nextDay } from 'date-fns';
import { RehearsalRepository } from '../../DAL/Rehearsal/rehearsal.repository';
import { ZAGON_CONFIG } from '../../zagon.config';

const ruLocale = require('date-fns/locale/ru')

export class GetAvailableRehearsalStartTimeHandler {
    private rehearsalRepository = new RehearsalRepository(); 

    public async handle(data: {rehearsalDate: string, duration: string}): Promise<string[]> {
        const rehearsalDate = new Date(parseInt(data.rehearsalDate));
        const duration = parseInt(data.duration);

        const nextDayAfterRehearsalStart = addDays(rehearsalDate, 1);
        const maxPossibleRehearsalEndTIme = addHours(nextDayAfterRehearsalStart, parseInt(data.duration) - 1);

        const rehearsals = await this.rehearsalRepository.getRehearsalsWhereStartTimeBetween(rehearsalDate, maxPossibleRehearsalEndTIme);

        const availableSlots: string[] = [];

        for (let startHour = ZAGON_CONFIG.START_HOUR; startHour <= ZAGON_CONFIG.END_HOUR; startHour++) {
            const currentSlotEndTime = startHour + duration;
            if (currentSlotEndTime > ZAGON_CONFIG.END_HOUR) {
                continue;
            }

            const slot = `${startHour}:00`;

            const start = this.getSlotStartTime(rehearsalDate, slot);
            const end = this.getSlotEndTime(start, duration);

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
            
            if (isValidSlot) {
                availableSlots.push(slot);
            }
        }

        return availableSlots;
    }

    private getSlotStartTime(date: Date, startTime: string): Date {
        const slotStartTime = new Date(date);

        const [startHour, startMinute] = startTime.split(':');
        slotStartTime.setHours(parseInt(startHour));
        slotStartTime.setMinutes(parseInt(startMinute));

        return slotStartTime;
    }

    private getSlotEndTime(slotStartTime: Date, duration: number): Date {
        return addHours(slotStartTime, duration);
    }
}