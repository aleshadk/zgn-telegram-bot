import { addDays, startOfToday } from 'date-fns';
import format from 'date-fns/format';

const ruLocale = require('date-fns/locale/ru')


interface IDateValue {
    label: string;
    value: Date;
}

export class GetAvailableRehearsalStateDatesHandler {
    private readonly availableDaysCountToScheduleExceptTodayAndTomorow = 5;


    public handle(): IDateValue[] {
        return this.getAvailableDates();
    }

    private getAvailableDates(): IDateValue[] {
        const now = startOfToday();
        const tomorrow = addDays(now, 1);

        const result = [
            { label: 'Сегодня', value: now },
            { label: `Завтра в ${this.getDayOfWeek(tomorrow)}.`, value: tomorrow },
        ];

        for (let i = 1; i <= this.availableDaysCountToScheduleExceptTodayAndTomorow; i++) {
            result.push(this.processDate(addDays(tomorrow, i)))
        }

        return result;
    }

    private processDate(date: Date): IDateValue {
        const dateString = format(
            date,
            'd MMMM',
            { locale: ruLocale }
        )

        return {
            label: `В ${this.getDayOfWeek(date)}. ${dateString}`,
            value: date
        }
    }

    private getDayOfWeek(date: Date): string {
        return format(
            date,
            'EEEEEE',
            { locale: ruLocale }
        ).toLowerCase();
    }
}
