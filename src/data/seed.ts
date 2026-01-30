import { formatISO, subDays, addDays } from 'date-fns';
import { CommitmentTypeEnum, CommitmentStatusEnum, CommitmentSourceEnum } from '../constants/Enums';
import { Commitment } from '../domain/types';

const now = new Date();

export const seedCommitments: Commitment[] = [
  // Active expiring soon (passport)
  {
    id: '1',
    type: CommitmentTypeEnum.EXPIRATION,
    title: 'Passport Renewal',
    targetAt: formatISO(addDays(now, 45)),
    status: CommitmentStatusEnum.ACTIVE,
    source: CommitmentSourceEnum.TEMPLATE,
    createdAt: formatISO(subDays(now, 30)),
    updatedAt: formatISO(subDays(now, 30)),
  },
  // Active far future (insurance)
  {
    id: '2',
    type: CommitmentTypeEnum.EXPIRATION,
    title: 'Car Insurance Renewal',
    targetAt: formatISO(addDays(now, 180)),
    status: CommitmentStatusEnum.ACTIVE,
    source: CommitmentSourceEnum.TEMPLATE,
    createdAt: formatISO(subDays(now, 60)),
    updatedAt: formatISO(subDays(now, 60)),
  },
  // Overdue (warranty)
  {
    id: '3',
    type: CommitmentTypeEnum.EXPIRATION,
    title: 'Laptop Warranty Expires',
    targetAt: formatISO(subDays(now, 5)),
    status: CommitmentStatusEnum.EXPIRED,
    source: CommitmentSourceEnum.TEMPLATE,
    createdAt: formatISO(subDays(now, 365)),
    updatedAt: formatISO(subDays(now, 5)),
  },
  // Done commitment
  {
    id: '4',
    type: CommitmentTypeEnum.DEADLINE,
    title: 'Submit Tax Documents',
    targetAt: formatISO(subDays(now, 10)),
    status: CommitmentStatusEnum.DONE,
    source: CommitmentSourceEnum.MANUAL,
    createdAt: formatISO(subDays(now, 20)),
    updatedAt: formatISO(subDays(now, 10)),
  },
  // Deadline-based task
  {
    id: '5',
    type: CommitmentTypeEnum.DEADLINE,
    title: 'Complete Project Proposal',
    targetAt: formatISO(addDays(now, 10)),
    status: CommitmentStatusEnum.ACTIVE,
    source: CommitmentSourceEnum.MANUAL,
    createdAt: formatISO(subDays(now, 5)),
    updatedAt: formatISO(subDays(now, 5)),
  },
  // Open-ended commitment
  {
    id: '6',
    type: CommitmentTypeEnum.OPEN,
    title: 'Review Insurance Options',
    targetAt: null,
    status: CommitmentStatusEnum.ACTIVE,
    source: CommitmentSourceEnum.MANUAL,
    createdAt: formatISO(subDays(now, 7)),
    updatedAt: formatISO(subDays(now, 7)),
    nextReviewAt: formatISO(addDays(now, 7)),
  },
];
