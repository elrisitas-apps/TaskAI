import type {
  CommitmentType,
  CommitmentStatus,
  CommitmentSource,
  ReminderStatus,
  ReminderSource,
} from '../constants/Enums';

export type { CommitmentType, CommitmentStatus, CommitmentSource, ReminderStatus, ReminderSource };

export interface Commitment {
  id: string;
  type: CommitmentType;
  title: string;
  targetAt: string | null; // ISO string, null for open-ended
  status: CommitmentStatus;
  source: CommitmentSource;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  nextReviewAt?: string; // ISO string, for open-ended commitments
}

export interface Reminder {
  id: string;
  commitmentId: string;
  scheduledAt: string; // ISO string
  status: ReminderStatus;
  snoozedUntil?: string; // ISO string
  createdAt: string;
  /** ReminderSourceEnum.LADDER = from ladder; ReminderSourceEnum.SNOOZE = user-added. Max 3 snoozes per commitment. */
  source?: ReminderSource;
}

export interface Template {
  id: string;
  name: string;
  type: CommitmentType;
  defaultTitle: string;
  defaultDays?: number; // For expiration/deadline types
}
