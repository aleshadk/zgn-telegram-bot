import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../Domain/User/user.repository';
import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';


interface IGetMyRehearsalsResponse {
    label: string;
    rehearsalId: string;
}

export class GetMyRehearsalsHandler {
    private readonly rehearsalRepository = new RehearsalRepository;;
    private readonly userRepository = new UserRepository;;


    public async handle(userTelegramId: number): Promise<IGetMyRehearsalsResponse[]> {
        const user = await this.userRepository.getUser({telegramId: userTelegramId});
        if (!user) {
            return [];
        }

        const rehearsals =  await this.rehearsalRepository.getUserActiveRehearsals(user);

        return rehearsals.map(x => {
            return {
                label: formatRehearsalDateWithDuration(x.startTime, x.endTime),
                rehearsalId: x.id,
            }
        });
    }
}