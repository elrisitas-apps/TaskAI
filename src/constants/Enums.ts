/**
 * Central enum constants for type/status comparisons.
 * Use these instead of string literals (e.g. CommitmentTypeEnum.OPEN instead of 'open').
 */

// CommitmentType
export const CommitmentTypeEnum = {
  EXPIRATION: 'expiration',
  DEADLINE: 'deadline',
  OPEN: 'open',
} as const;
export type CommitmentType = (typeof CommitmentTypeEnum)[keyof typeof CommitmentTypeEnum];

// CommitmentStatus
export const CommitmentStatusEnum = {
  ACTIVE: 'active',
  DONE: 'done',
  EXPIRED: 'expired',
} as const;
export type CommitmentStatus = (typeof CommitmentStatusEnum)[keyof typeof CommitmentStatusEnum];

// CommitmentSource
export const CommitmentSourceEnum = {
  TEMPLATE: 'template',
  MANUAL: 'manual',
} as const;
export type CommitmentSource = (typeof CommitmentSourceEnum)[keyof typeof CommitmentSourceEnum];

// ReminderStatus
export const ReminderStatusEnum = {
  PENDING: 'pending',
  SENT: 'sent',
  CANCELLED: 'cancelled',
  SNOOZED: 'snoozed',
} as const;
export type ReminderStatus = (typeof ReminderStatusEnum)[keyof typeof ReminderStatusEnum];

// ReminderSource (ladder = generated; snooze = user-added)
export const ReminderSourceEnum = {
  LADDER: 'ladder',
  SNOOZE: 'snooze',
} as const;
export type ReminderSource = (typeof ReminderSourceEnum)[keyof typeof ReminderSourceEnum];
