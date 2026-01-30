import { addDays, subDays, parseISO, formatISO } from 'date-fns';
import { CommitmentTypeEnum, CommitmentStatusEnum, ReminderStatusEnum, ReminderSourceEnum } from '../constants/Enums';
import { Commitment, Reminder } from './types';

/**
 * Generate reminder ladder dates based on commitment type
 */
export function generateReminderLadder(
  commitment: Commitment,
  targetDate: Date
): Date[] {
  const dates: Date[] = [];

  switch (commitment.type) {
    case CommitmentTypeEnum.EXPIRATION:
      // Expiration ladder: 90d, 30d, 7d, 1d before targetAt
      dates.push(subDays(targetDate, 90));
      dates.push(subDays(targetDate, 30));
      dates.push(subDays(targetDate, 7));
      dates.push(subDays(targetDate, 1));
      break;

    case CommitmentTypeEnum.DEADLINE:
      // Deadline ladder: 14d, 7d, 1d before targetAt
      dates.push(subDays(targetDate, 14));
      dates.push(subDays(targetDate, 7));
      dates.push(subDays(targetDate, 1));
      break;

    case CommitmentTypeEnum.OPEN:
      // Open-ended ladder: 14d after creation, then every 30d
      const createdAt = parseISO(commitment.createdAt);
      dates.push(addDays(createdAt, 14));
      // For MVP, we'll generate next 3 review dates
      dates.push(addDays(createdAt, 44)); // 14 + 30
      dates.push(addDays(createdAt, 74)); // 14 + 30 + 30
      break;
  }

  // Filter out past dates and sort
  const now = new Date();
  return dates.filter((date) => date >= now).sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Get next review date for open-ended commitments
 */
export function getNextReviewDate(commitment: Commitment): Date | null {
  if (commitment.type !== CommitmentTypeEnum.OPEN) {
    return null;
  }

  if (commitment.nextReviewAt) {
    return parseISO(commitment.nextReviewAt);
  }

  // Default: 14 days after creation
  const createdAt = parseISO(commitment.createdAt);
  return addDays(createdAt, 14);
}

/**
 * Generate reminders from commitment
 */
export function generateRemindersFromCommitment(
  commitment: Commitment
): Omit<Reminder, 'id' | 'createdAt'>[] {
  if (commitment.status === CommitmentStatusEnum.DONE || commitment.status === CommitmentStatusEnum.EXPIRED) {
    return [];
  }

  let targetDate: Date;

  if (commitment.type === CommitmentTypeEnum.OPEN) {
    const nextReview = getNextReviewDate(commitment);
    if (!nextReview) {
      return [];
    }
    targetDate = nextReview;
  } else if (commitment.targetAt) {
    targetDate = parseISO(commitment.targetAt);
  } else {
    return [];
  }

  const ladderDates = generateReminderLadder(commitment, targetDate);
  const now = formatISO(new Date());

  return ladderDates.map((date) => ({
    commitmentId: commitment.id,
    scheduledAt: formatISO(date),
    status: ReminderStatusEnum.PENDING,
    source: ReminderSourceEnum.LADDER,
  }));
}
