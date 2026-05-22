// All display-time conversions go through this module.
// Server always sends ISO UTC; the UI always renders in Asia/Jerusalem.

import { formatInTimeZone } from 'date-fns-tz';
import { differenceInMinutes, differenceInSeconds } from 'date-fns';

export const ISRAEL_TZ = 'Asia/Jerusalem';

export function formatIsraelTime(
  isoInput: string | Date,
  pattern = 'HH:mm',
): string {
  return formatInTimeZone(new Date(isoInput), ISRAEL_TZ, pattern);
}

export function formatIsraelDateTime(isoInput: string | Date): string {
  return formatInTimeZone(new Date(isoInput), ISRAEL_TZ, 'dd/MM HH:mm');
}

export function minutesUntil(isoInput: string | Date): number {
  return differenceInMinutes(new Date(isoInput), new Date());
}

export function secondsUntil(isoInput: string | Date): number {
  return differenceInSeconds(new Date(isoInput), new Date());
}

export function isPast(isoInput: string | Date): boolean {
  return new Date(isoInput).getTime() <= Date.now();
}

/** Hebrew countdown string for lock-state banners. */
export function countdownHebrew(targetIso: string | Date): string {
  const seconds = secondsUntil(targetIso);
  if (seconds <= 0) return 'נעול';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `בעוד ${days} ימים ו-${hours} שעות`;
  if (hours > 0) return `בעוד ${hours} שעות ו-${minutes} דקות`;
  if (minutes > 0) return `בעוד ${minutes} דקות`;
  return `בעוד פחות מדקה`;
}
