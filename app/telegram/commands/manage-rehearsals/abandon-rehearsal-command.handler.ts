import { Context } from 'telegraf';

import { IRehearsalFullModel, RehearsalStatus } from '../../../Domain/Rehearsal/rehearsal.model';
import { rehearsalRepository } from '../../../Domain/Rehearsal/rehearsal.repository';
import { IUser } from '../../../Domain/User/user.model';
import { userRepository } from '../../../Domain/User/user.repository';
import {
  NotifyAdminAboutRehearsalStatusChangeHandler,
} from '../../../handlers/rehearsal-confirmation/notify-admin-about-rehearsal-status-change.handler';
import { formatRehearsalDateTime } from '../../../utils/dateUtils';

interface IData {
  rehearsalId: string;
}

class AbandonRehearsalsCommandHandler {
  public readonly suffix = 'abandon';

  public async handle(ctx: Context, input: string): Promise<void> {
    const data = this.parseData(input);

    const user = await userRepository.getUser({ telegramId: ctx.from?.id });
    const rehearsal = await rehearsalRepository.getRehearsalById(data.rehearsalId);

    if (!user || !rehearsal) {
      return;
    }

    const hasPermissions = rehearsal.createdBy.telegramId === ctx.from?.id || user.isAdmin;

    if (!hasPermissions) {
      return;
    }

    const isRehearsalInactive = [RehearsalStatus.AbandonByUser, RehearsalStatus.Rejected].includes(rehearsal.status);

    if (isRehearsalInactive) {
      ctx.reply('Эта репетиция и так не активна');
      return;
    }

    await rehearsalRepository.changeRehearsalStatus(data.rehearsalId, RehearsalStatus.AbandonByUser);
    this.sendNotificationsToAdmins(rehearsal!, user!);

    if (user.telegramId === rehearsal.createdBy?.telegramId) {
      ctx.reply(`Твоя репетиция ${formatRehearsalDateTime(rehearsal?.startTime!)} отменена`);
    }

  }

  public createTelegramComandString(model: IData): string {
    return [
      this.suffix,
      model.rehearsalId
    ].join('__');
  }

  private parseData(input: string): IData {
    const [_, rehearsalId] = input.split('__');
    return {
      rehearsalId,
    }
  }

  private sendNotificationsToAdmins(
    rehearsal: IRehearsalFullModel,
    currentUser: IUser,
  ): void {
    const message = `❌ ${currentUser.firstName} отменил репетицию ${formatRehearsalDateTime(rehearsal.startTime)} пользователя ${rehearsal.createdBy.firstName}`;
    new NotifyAdminAboutRehearsalStatusChangeHandler().handle(message)
  }
}

export const abandonRehearsalCommand = new AbandonRehearsalsCommandHandler();
