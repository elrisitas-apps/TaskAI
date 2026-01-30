import { formatISO } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommitmentsRepository } from '../repositories/CommitmentsRepository';
import { Commitment } from '../../domain/types';
import { seedCommitments } from '../seed';
import { generateId } from '../../utils/id';

const STORAGE_KEY = '@TaskAI:commitments';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

// Load commitments from storage or use seed data
const loadCommitments = async (): Promise<Commitment[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // First time - use seed data
    return [...seedCommitments];
  } catch (error) {
    console.error('Error loading commitments:', error);
    return [...seedCommitments];
  }
};

// Save commitments to storage
const saveCommitments = async (commitments: Commitment[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(commitments));
  } catch (error) {
    console.error('Error saving commitments:', error);
  }
};

// Initialize commitments array - will be loaded on first access
let commitments: Commitment[] = [];
let isInitialized = false;

const ensureInitialized = async (): Promise<void> => {
  if (!isInitialized) {
    commitments = await loadCommitments();
    isInitialized = true;
  }
};

export const mockCommitmentsRepository: CommitmentsRepository = {
  getAll: async () => {
    await ensureInitialized();
    await delay(100);
    return [...commitments];
  },

  getById: async (id: string) => {
    await ensureInitialized();
    await delay(50);
    return commitments.find((c) => c.id === id) || null;
  },

  create: async (commitment: Omit<Commitment, 'id' | 'createdAt' | 'updatedAt'>) => {
    await ensureInitialized();
    await delay(150);
    const now = formatISO(new Date());
    const newCommitment: Commitment = {
      ...commitment,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    commitments.push(newCommitment);
    await saveCommitments(commitments);
    return newCommitment;
  },

  update: async (id: string, updates: Partial<Commitment>) => {
    await ensureInitialized();
    await delay(100);
    const index = commitments.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Commitment with id ${id} not found`);
    }
    const updated: Commitment = {
      ...commitments[index],
      ...updates,
      updatedAt: formatISO(new Date()),
    };
    commitments[index] = updated;
    await saveCommitments(commitments);
    return updated;
  },

  delete: async (id: string) => {
    await ensureInitialized();
    await delay(100);
    const index = commitments.findIndex((c) => c.id === id);
    if (index !== -1) {
      commitments.splice(index, 1);
      await saveCommitments(commitments);
    }
  },
};
