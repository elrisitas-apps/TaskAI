import React from 'react';
import { TextInputProps, ViewStyle } from 'react-native';
import { Commitment, Reminder, Template, CommitmentType, CommitmentStatus, CommitmentSource } from '../domain/types';
import { AuthUser, AuthSession } from '../data/repositories/AuthRepository';

// Domain Interfaces
export type { Commitment, Reminder, Template, CommitmentType, CommitmentStatus, CommitmentSource };
export interface UrgencyScore {
  commitment: Commitment;
  score: number;
  reason: string;
}

// Repository Interfaces
export interface CommitmentsRepository {
  getAll(): Promise<Commitment[]>;
  getById(id: string): Promise<Commitment | null>;
  create(commitment: Omit<Commitment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Commitment>;
  update(id: string, updates: Partial<Commitment>): Promise<Commitment>;
  delete(id: string): Promise<void>;
}

export interface RemindersRepository {
  getAll(): Promise<Reminder[]>;
  getByCommitmentId(commitmentId: string): Promise<Reminder[]>;
  create(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<Reminder>;
  update(id: string, updates: Partial<Reminder>): Promise<Reminder>;
  delete(id: string): Promise<void>;
  deleteByCommitmentId(commitmentId: string): Promise<void>;
}

export type { AuthUser, AuthSession };

export interface AuthRepository {
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(email: string, password: string, name: string): Promise<AuthSession>;
  signInWithGoogle(): Promise<AuthSession>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
}

// UI Component Interfaces
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export interface BadgeProps {
  label: string;
  variant?: CommitmentStatus;
  style?: ViewStyle;
}

export interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface ListItemProps {
  title: string;
  subtitle?: string;
  /** When set, shown above secondarySubtitle with more prominent style. Ignored if subtitle is also used. */
  primarySubtitle?: string;
  /** When set, shown below primarySubtitle with normal style. */
  secondarySubtitle?: string;
  badge?: { label: string; variant: CommitmentStatus };
  /** Optional left accent (e.g. urgency color for active items) */
  accentColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  /** If provided, shows "Mark as Done" button */
  onMarkDone?: () => void;
  /** If not provided, no title is shown */
  title?: string;
}

export interface ReminderActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title?: string;
}

export interface ReminderDateModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialDateTime?: Date;
  /** If set, reminder date must be on or before this (task target date). Omit for open-ended tasks. */
  maxDate?: Date | null;
  /** When mode is 'add', show this target date (ISO string) for reference, formatted as YYYY-MM-DD. */
  targetDateForReference?: string | null;
  onClose: () => void;
  /** Return a string (or Promise<string>) to show as error and keep modal open; return void to close on success. */
  onSave: (dateTime: Date) => void | string | Promise<void | string>;
  onDelete?: () => void | Promise<void>;
}

// Store State Interfaces
export interface OnboardingState {
  hasSeenOnboarding: boolean;
}

export interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface CommitmentsState {
  commitments: Commitment[];
  isLoading: boolean;
  error: string | null;
}
