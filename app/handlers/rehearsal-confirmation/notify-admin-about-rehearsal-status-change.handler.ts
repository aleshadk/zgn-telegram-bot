import { UserRepository } from '../../Domain/User/user.repository';
import { telegramBot } from '../../telegram/telegram-bot';

export class NotifyAdminAboutRehearsalStatusChangeHandler {
  private readonly userRepository = new UserRepository;

  public async handle(message: string): Promise<void> {
    const admins = await this.userRepository.getAdminUsers();
    admins.forEach(x => {
      telegramBot.telegram.sendMessage(x.telegramId, message);
    });
  }
}
