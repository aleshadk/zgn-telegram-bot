export class GetAvailableRehearsalDuractionHandler {
    private readonly durations = [
        1, 2, 3, 4,
    ];


    public handle(): number[] {
        return this.durations;
    }
}