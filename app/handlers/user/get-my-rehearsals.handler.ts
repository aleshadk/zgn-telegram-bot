import { Rehearsal } from '../../Domain/Rehearsal/rehearsal.entity';
import { RehearsalRepository } from '../../Domain/Rehearsal/rehearsal.repository';
import { UserRepository } from '../../Domain/User/user.repository';


export class GetMyRehearsalsHandler {
  private readonly rehearsalRepository = new RehearsalRepository;
  private readonly userRepository = new UserRepository;

  public async handle(userTelegramId: number): Promise<Rehearsal[]> {
    const user = await this.userRepository.getUser({ telegramId: userTelegramId });
    if (!user) {
      return [];
    }

    return await this.rehearsalRepository.getUserActiveRehearsals(user);
  }
}