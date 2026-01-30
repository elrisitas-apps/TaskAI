import { format, parseISO, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';
import { COMMON_STRINGS } from '../constants/Strings';

export function formatDate(date: string | null): string {
  if (!date) return COMMON_STRINGS.NO_DATE;
  return format(parseISO(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | null): string {
  if (!date) return COMMON_STRINGS.NO_DATE;
  return format(parseISO(date), 'MMM d, yyyy h:mm a');
}

export function formatRelative(date: string | null): string {
  if (!date) return COMMON_STRINGS.NO_DATE;
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function isDatePast(date: string | null): boolean {
  if (!date) return false;
  return isPast(parseISO(date));
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return differenceInDays(parseISO(date), new Date());
}

/** Urgency band for active commitments: ≤3 days = urgent, 4–29 = soon, ≥30 = ok */
export type UrgencyBand = 'urgent' | 'soon' | 'ok';

export function getUrgencyBand(days: number | null): UrgencyBand {
  if (days === null || days < 0) return 'urgent';
  if (days <= 3) return 'urgent';
  if (days <= 29) return 'soon';
  return 'ok';
}
