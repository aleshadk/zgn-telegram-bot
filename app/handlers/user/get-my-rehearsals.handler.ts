import { IRehearsal, RehearsalStatus } from '../../Domain/Rehearsal/rehearsal.model';
import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../Domain/User/user.repository';
import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';


interface IGetMyRehearsalsResponse {
  label: string;
  rehearsalId: string;
}

export class GetMyRehearsalsHandler {
  private readonly rehearsalRepository = new RehearsalRepository;
  private readonly userRepository = new UserRepository;


  public async handle(userTelegramId: number): Promise<IGetMyRehearsalsResponse[]> {
    const user = await this.userRepository.getUser({ telegramId: userTelegramId });
    if (!user) {
      return [];
    }

    const rehearsals = await this.rehearsalRepository.getUserActiveRehearsals(user);

    return rehearsals.map(x => {
      return {
        label: this.getRehearsalLabel(x),
        rehearsalId: x.id,
      };
    });
  }

  private getRehearsalLabel(rehearsal: IRehearsal): string {
    return `${formatRehearsalDateWithDuration(rehearsal.startTime, rehearsal.endTime)} ${this.getRehearsalStatusLabel(rehearsal)}`;
  }

  private getRehearsalStatusLabel(rehearsal: IRehearsal): string {
    switch (rehearsal.status) {
      case RehearsalStatus.Draft:
        return '🤔 ждёт подтверждения';
      case RehearsalStatus.Confirmed:
        return '✅ подтверждена';
      case RehearsalStatus.Rejected:
        return '❌ отклонена';
      case RehearsalStatus.AbandonByUser:
        return '❌ отменена';
    }
  }
}