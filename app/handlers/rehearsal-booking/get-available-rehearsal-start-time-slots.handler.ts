import { addDays, addHours, isToday } from 'date-fns';

import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { getNextHour } from '../../utils/dateUtils';
import { ZAGON_CONFIG } from '../../zagon.config';

export class GetAvailableRehearsalStartTimeSlotsHandler {
  private rehearsalRepository = new RehearsalRepository();

  // TODO: refactor huge method
  // May be put into FreeSlotCalculateService?
  public async handle(data: { rehearsalDate: Date, rehearsalDuration: number }): Promise<string[]> {
    const rehearsalDate = data.rehearsalDate;
    const duration = data.rehearsalDuration;

    const nextDayAfterRehearsalStart = addDays(rehearsalDate, 1);
    const maxPossibleRehearsalEndTIme = addHours(nextDayAfterRehearsalStart, data.rehearsalDuration - 1);

    const existedRehearsals = await this.rehearsalRepository.getActiveRehearsalsInConflictWithSlot(rehearsalDate, maxPossibleRehearsalEndTIme);

    const availableSlots: string[] = [];

    let startHour = isToday(rehearsalDate)
      ? getNextHour()
      : ZAGON_CONFIG.START_HOUR;

    for (startHour; startHour <= ZAGON_CONFIG.END_HOUR; startHour++) {
      const currentSlotEndTime = startHour + duration;
      if (currentSlotEndTime > ZAGON_CONFIG.END_HOUR) {
        continue;
      }

      const slot = `${startHour}:00`;

      const start = this.getSlotStartTime(rehearsalDate, slot);
      const end = this.getSlotEndTime(start, duration);

      const hasConflictRehearsal = existedRehearsals.some(r => {
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