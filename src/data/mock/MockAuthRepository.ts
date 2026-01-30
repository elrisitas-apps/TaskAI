import { formatISO, addDays } from 'date-fns';
import { AuthRepository, AuthSession } from '../repositories/AuthRepository';
import { generateId } from '../../utils/id';

let currentSession: AuthSession | null = null;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

export const mockAuthRepository: AuthRepository = {
  signIn: async (email: string, password: string) => {
    await delay(500);
    const session: AuthSession = {
      user: {
        id: generateId(),
        email,
        name: email.split('@')[0],
      },
      token: `mock-token-${generateId()}`,
      expiresAt: formatISO(addDays(new Date(), 7)),
    };
    currentSession = session;
    return session;
  },

  signUp: async (email: string, password: string, name: string) => {
    await delay(500);
    const session: AuthSession = {
      user: {
        id: generateId(),
        email,
        name,
      },
      token: `mock-token-${generateId()}`,
      expiresAt: formatISO(addDays(new Date(), 7)),
    };
    currentSession = session;
    return session;
  },

  signInWithGoogle: async () => {
    await delay(500);
    const session: AuthSession = {
      user: {
        id: generateId(),
        email: 'user@gmail.com',
        name: 'Google User',
      },
      token: `mock-token-${generateId()}`,
      expiresAt: formatISO(addDays(new Date(), 7)),
    };
    currentSession = session;
    return session;
  },

  signOut: async () => {
    await delay(200);
    currentSession = null;
  },

  getCurrentSession: async () => {
    await delay(50);
    return currentSession;
  },
};
