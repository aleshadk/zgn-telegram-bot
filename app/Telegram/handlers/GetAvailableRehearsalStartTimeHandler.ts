const ruLocale = require('date-fns/locale/ru')

export class GetAvailableRehearsalStartTimeHandler {
    private readonly availableRehearsalStartTime = [
        '10:00',
        '11:00',
        '12:00',
    ];

    public handle(): string[] {
        return this.availableRehearsalStartTime;
    }
}