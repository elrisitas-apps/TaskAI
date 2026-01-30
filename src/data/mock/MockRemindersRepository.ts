import { formatISO } from 'date-fns';
import { CommitmentStatusEnum, ReminderSourceEnum } from '../../constants/Enums';
import { RemindersRepository } from '../repositories/RemindersRepository';
import { Reminder } from '../../domain/types';
import { generateRemindersFromCommitment } from '../../domain/ladder';
import { seedCommitments } from '../seed';
import { generateId } from '../../utils/id';

const reminders: Reminder[] = [];

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

// Initialize reminders from seed commitments
seedCommitments.forEach((commitment) => {
  if (commitment.status === CommitmentStatusEnum.ACTIVE) {
    const reminderData = generateRemindersFromCommitment(commitment);
    reminderData.forEach((data) => {
      reminders.push({
        ...data,
        id: generateId(),
        createdAt: formatISO(new Date()),
        source: data.source ?? ReminderSourceEnum.LADDER,
      });
    });
  }
});

export const mockRemindersRepository: RemindersRepository = {
  getAll: async () => {
    await delay(100);
    return [...reminders];
  },

  getByCommitmentId: async (commitmentId: string) => {
    await delay(50);
    return reminders.filter((r) => r.commitmentId === commitmentId);
  },

  create: async (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    await delay(100);
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
      createdAt: formatISO(new Date()),
    };
    reminders.push(newReminder);
    return newReminder;
  },

  update: async (id: string, updates: Partial<Reminder>) => {
    await delay(100);
    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    const updated: Reminder = {
      ...reminders[index],
      ...updates,
    };
    reminders[index] = updated;
    return updated;
  },

  delete: async (id: string) => {
    await delay(100);
    const index = reminders.findIndex((r) => r.id === id);
    if (index !== -1) {
      reminders.splice(index, 1);
    }
  },

  deleteByCommitmentId: async (commitmentId: string) => {
    await delay(100);
    const filtered = reminders.filter((r) => r.commitmentId !== commitmentId);
    reminders.length = 0;
    reminders.push(...filtered);
  },
};
