import { WeekDays } from '../../common/enum';

export interface WeekDaysWithTime {
  day: WeekDays;
  startTime: Date;
  endTime: Date;
}
