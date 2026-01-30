// Export repository instances
// In production, these would be swapped for Firebase/Supabase implementations

import { mockCommitmentsRepository } from '../mock/MockCommitmentsRepository';
import { mockRemindersRepository } from '../mock/MockRemindersRepository';
import { mockAuthRepository } from '../mock/MockAuthRepository';

export const commitmentsRepository = mockCommitmentsRepository;
export const remindersRepository = mockRemindersRepository;
export const authRepository = mockAuthRepository;
