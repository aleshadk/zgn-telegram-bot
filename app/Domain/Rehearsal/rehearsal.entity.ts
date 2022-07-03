import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';
import { IUser } from '../User/user.model';
import { IRehearsal, IRehearsalFull, RehearsalStatus } from './rehearsal.model';

export class Rehearsal {
  public readonly id: string;
  public readonly startTime: Date;
  public readonly endTime: Date;
  public readonly status: RehearsalStatus;

  constructor(model: IRehearsal) {
    this.id = model._id;
    this.startTime = model.startTime;
    this.endTime = model.endTime;
    this.status = model.status;
  }

  /**
   * @example "Сегодня в 20:00 на 1 час" или "5 июля 18:00 на 3 часа" 
   */
  public getLabel(): string {
    return formatRehearsalDateWithDuration(this.startTime, this.endTime);
  }

  public getLabelWithStatus(): string {
    return `${this.getLabel()} ${this.getStatusLabel()}`;
  }

  public getStatusLabel(): string {
    switch (this.status) {
      case RehearsalStatus.Draft:
        return '⏳';
      case RehearsalStatus.Confirmed:
        return '✅';
      case RehearsalStatus.Rejected:
        return '❌';
      case RehearsalStatus.AbandonByUser:
        return '❌';
    }
  }

  public isActive(): boolean {
    return [RehearsalStatus.Confirmed, RehearsalStatus.Draft].includes(this.status);
  }

  public isRejected(): boolean {
    return this.status === RehearsalStatus.Rejected;
  }
}

export class RehearsalFull extends Rehearsal {
  public readonly createdBy: IUser;
  constructor(model: IRehearsalFull) {
    super(model);
    this.createdBy = model.createdBy;
  }

  public isCreatedBy(userTelegramId?: number): boolean {
    if (!userTelegramId) {
      return false;
    }

    return this.createdBy.telegramId === userTelegramId;
  }
}