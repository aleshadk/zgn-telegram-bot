import { formatRehearsalDateWithDuration } from '../../utils/dateUtils';
import { IRehearsalModel, RehearsalStatus } from './rehearsal.model';

export class Rehearsal {
  public readonly id: string;
  public readonly startTime: Date;
  public readonly endTime: Date;
  public readonly status: RehearsalStatus;

  constructor(model: IRehearsalModel) {
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
}
