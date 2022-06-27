type UserTelegramId = number;

class UserCommandQueueLocker {
    private readonly queue: {[key: UserTelegramId]: boolean} = {};

    public add(id: UserTelegramId): void {
        if (id) {
            this.queue[id] = true;
        }
    }

    public remove(id: UserTelegramId): void {
        delete this.queue[id];
    }

    public isLocked(id: UserTelegramId): boolean {
        return this.queue[id] === true;
    }
}

export const userCommandQueueLocker = new UserCommandQueueLocker();