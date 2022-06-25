import { format, formatDistanceStrict, isToday, isTomorrow } from 'date-fns';
const ruLocale = require('date-fns/locale/ru')

export function formatRehearsalDateTime(date: Date): string {
    if (isToday(date)) {
        return `Сегодня в ${format(date, 'HH:mm', {locale: ruLocale})}`;
    }

    if (isTomorrow(date)) {
        return `Завтра в ${format(date, 'HH:mm', {locale: ruLocale})}`;
    }

    return format(
        date,
        'd MMMM HH:mm',
        { locale: ruLocale }
      )
}

export function formatRehearsalDateWithDuration(start: Date, end: Date): string {
    const dateTime = formatRehearsalDateTime(start);

    const duration = formatDistanceStrict(start, end, {
        unit: 'hour',
        locale: ruLocale
      });

    return `${dateTime} на ${duration}`;
}

export function getNextHour(): number {
    const now = new Date();
    const hour = format(now, 'H', {locale: ruLocale});

    return parseInt(hour) + 1;
}