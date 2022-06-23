import startOfDay from 'date-fns/startOfDay';
import format from 'date-fns/format';
import { addDays } from 'date-fns';
const ruLocale = require('date-fns/locale/ru')

interface IDateValue {
    label: string;
    value: Date;
}

export class GetAvailableRehearsalDuractionHandler {
    private readonly durations = [
        1, 2, 3, 4,
    ];


    public handle(): number[] {
        return this.durations;
    }
}