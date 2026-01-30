import { parseISO, isPast, differenceInDays } from 'date-fns';
import { CommitmentStatusEnum, ReminderStatusEnum } from '../constants/Enums';
import { URGENCY_STRINGS } from '../constants/Strings';
import { Commitment, Reminder } from './types';
import { UrgencyScore } from '../constants/Interfaces';

export type { UrgencyScore };

/**
 * Calculate urgency score for a commitment
 * Higher score = more urgent
 */
export function calculateUrgencyScore(
  commitment: Commitment,
  reminders: Reminder[]
): UrgencyScore {
  // Done commitments have no urgency
  if (commitment.status === CommitmentStatusEnum.DONE) {
    return {
      commitment,
      score: 0,
      reason: URGENCY_STRINGS.COMPLETED,
    };
  }

  const now = new Date();

  // Check if expired (status is 'active' or 'expired' at this point)
  if (commitment.targetAt) {
    const targetDate = parseISO(commitment.targetAt);
    if (isPast(targetDate)) {
      return {
        commitment,
        score: 1000, // Highest priority
        reason: URGENCY_STRINGS.EXPIRED,
      };
    }
  }

  // Find next pending reminder
  const nextReminder = reminders
    .filter((r) => r.commitmentId === commitment.id && r.status === ReminderStatusEnum.PENDING)
    .sort((a, b) => parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime())[0];

  if (nextReminder) {
    const reminderDate = parseISO(nextReminder.scheduledAt);
    const daysUntil = differenceInDays(reminderDate, now);

    if (daysUntil < 0) {
      return {
        commitment,
        score: 900,
        reason: URGENCY_STRINGS.OVERDUE_REMINDER,
      };
    }

    // Score based on days until reminder (fewer days = higher score)
    return {
      commitment,
      score: Math.max(0, 100 - daysUntil),
      reason: URGENCY_STRINGS.DAYS_UNTIL_REMINDER(daysUntil),
    };
  }

  // Fallback: use targetAt if available
  if (commitment.targetAt) {
    const targetDate = parseISO(commitment.targetAt);
    const daysUntil = differenceInDays(targetDate, now);

    if (daysUntil < 0) {
      return {
        commitment,
        score: 800,
        reason: URGENCY_STRINGS.PAST_TARGET_DATE,
      };
    }

    return {
      commitment,
      score: Math.max(0, 50 - daysUntil / 10),
      reason: URGENCY_STRINGS.DAYS_UNTIL_TARGET(daysUntil),
    };
  }

  // Open-ended with no target
  return {
    commitment,
    score: 10,
    reason: URGENCY_STRINGS.OPEN_ENDED,
  };
}

/**
 * Sort commitments by urgency (next reminder / target)
 */
export function sortByUrgency(
  commitments: Commitment[],
  reminders: Reminder[]
): Commitment[] {
  const scored = commitments.map((c) => calculateUrgencyScore(c, reminders));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.commitment);
}

/**
 * Sort commitments by target date (closest first). Open-ended (no targetAt) go last.
 */
export function sortByTargetDate(commitments: Commitment[]): Commitment[] {
  return [...commitments].sort((a, b) => {
    const timeA = a.targetAt ? new Date(a.targetAt).getTime() : Infinity;
    const timeB = b.targetAt ? new Date(b.targetAt).getTime() : Infinity;
    return timeA - timeB;
  });
}
