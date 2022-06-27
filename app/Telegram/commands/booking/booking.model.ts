export interface IChooseDateCommandModel {
    rehearsalDate: Date; 
}

export interface IChooseDurationCommandModel extends IChooseDateCommandModel {
    rehearsalDuration: number; 
}

export interface IChooseStartTimeCommandModel extends IChooseDurationCommandModel {
    rehearsalStartTime: string; 
}