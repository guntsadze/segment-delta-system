export interface ISystemLog {
  id: string | number;
  time: string;
  type: LogType;
  message: string;
}

export type LogType = 'added' | 'removed' | 'mixed' | 'update' | 'action';
