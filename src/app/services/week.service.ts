import { Injectable } from '@angular/core';
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from 'date-fns';

export interface PlannerDayColumn {
  box: string;
  day: string;
  date: Date;
  dateKey: string;
  dateLabel: string;
}

const WEEKDAY_BOXES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Injectable({
  providedIn: 'root',
})
export class WeekService {
  getWeekStart(value: Date = new Date()): Date {
    return startOfWeek(value, { weekStartsOn: 1 });
  }

  getWeekEnd(weekStart: Date): Date {
    return addDays(weekStart, 6);
  }

  shiftWeek(weekStartMonday: Date, delta: number): Date {
    return addDays(weekStartMonday, delta * 7);
  }

  toDateKey(value: Date): string {
    return format(value, 'yyyy-MM-dd');
  }

  parseDateKey(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  formatWeekRange(weekStart: Date): string {
    const weekEnd = this.getWeekEnd(weekStart);
    const startLabel = format(weekStart, 'd MMM');
    const endLabel = format(weekEnd, 'd MMM yyyy');
    return `${startLabel} – ${endLabel}`;
  }

  isCurrentWeek(weekStart: Date): boolean {
    return this.toDateKey(weekStart) === this.toDateKey(this.getWeekStart(new Date()));
  }

  isTodayDate(value: Date): boolean {
    return isToday(value);
  }

  isSameDate(left: Date, right: Date): boolean {
    return isSameDay(left, right);
  }

  getDayColumns(weekStart: Date): PlannerDayColumn[] {
    return WEEKDAY_BOXES.map((box, index) => {
      const date = addDays(weekStart, index);
      return {
        box,
        day: WEEKDAY_NAMES[index],
        date,
        dateKey: this.toDateKey(date),
        dateLabel: format(date, 'd MMM'),
      };
    });
  }

  getTodayColumnDateKey(weekStart: Date): string | null {
    const today = new Date();
    if (!this.isCurrentWeek(weekStart)) {
      return null;
    }
    return this.toDateKey(today);
  }

  whereForScheduledDate(value: Date): string {
    const weekStart = this.getWeekStart(value);
    const delta = differenceInCalendarDays(
      this.parseDateKey(this.toDateKey(value)),
      this.parseDateKey(this.toDateKey(weekStart))
    );
    return WEEKDAY_BOXES[delta] ?? 'mon';
  }
}
