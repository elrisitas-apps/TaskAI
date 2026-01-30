import { z } from 'zod';
import { CommitmentTypeEnum, CommitmentSourceEnum } from '../constants/Enums';

export const commitmentFormSchema = z.object({
  type: z.enum([CommitmentTypeEnum.EXPIRATION, CommitmentTypeEnum.DEADLINE, CommitmentTypeEnum.OPEN]),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  targetAt: z.string().nullable(),
  source: z.enum([CommitmentSourceEnum.TEMPLATE, CommitmentSourceEnum.MANUAL]),
});

export type CommitmentFormData = z.infer<typeof commitmentFormSchema>;
