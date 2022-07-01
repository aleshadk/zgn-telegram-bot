import { Context } from 'telegraf';

import { RehearsalFull } from '../../../Domain/Rehearsal/rehearsal.entity';
import { RehearsalStatus } from '../../../Domain/Rehearsal/rehearsal.model';
import { rehearsalRepository } from '../../../Domain/Rehearsal/rehearsal.repository';
import {
  NotifyAdminAboutRehearsalStatusChangeHandler,
} from '../../../handlers/rehearsal-confirmation/notify-admin-about-rehearsal-status-change.handler';

interface IData {
  rehearsalId: string;
}

class AbandonRehearsalsCommandHandler {
  public readonly suffix = 'abandon';

  public async handle(ctx: Context, input: string): Promise<void> {
    const data = this.parseData(input);
    const rehearsal = await rehearsalRepository.getRehearsalById(data.rehearsalId);

    if (!rehearsal || !rehearsal.isCreatedBy(ctx.from?.id)) {
      return;
    }

    if (!rehearsal.isActive()) {
      ctx.reply('Эта репетиция и так не активна');
      return;
    }

    await rehearsalRepository.changeRehearsalStatus(data.rehearsalId, RehearsalStatus.AbandonByUser);
    this.sendNotificationsToAdmins(rehearsal);
    ctx.reply(`Твоя репетиция ${rehearsal.getLabel()} отменена`);
  }

  public createTelegramCommandString(model: IData): string {
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

  private sendNotificationsToAdmins(rehearsal: RehearsalFull,): void {
    const message = `❌ ${rehearsal.createdBy.firstName} отменил свою репетицию ${rehearsal.getLabel()} пользователя`;
    new NotifyAdminAboutRehearsalStatusChangeHandler().handle(message)
  }
}

export const abandonRehearsalCommand = new AbandonRehearsalsCommandHandler();
