import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CommitmentStatusEnum, ReminderStatusEnum } from '../../constants/Enums';
import { Commitment } from '../../domain/types';
import { CommitmentsState } from '../../constants/Interfaces';
import { commitmentsRepository, remindersRepository } from '../../data/repositories';
import { generateRemindersFromCommitment } from '../../domain/ladder';
import { formatISO } from 'date-fns';

const initialState: CommitmentsState = {
  commitments: [],
  isLoading: false,
  error: null,
};

export const fetchCommitments = createAsyncThunk('commitments/fetchAll', async () => {
  return await commitmentsRepository.getAll();
});

export const fetchCommitmentById = createAsyncThunk(
  'commitments/fetchById',
  async (id: string) => {
    return await commitmentsRepository.getById(id);
  }
);

// Add reducer for fetchCommitmentById to update state

export const createCommitment = createAsyncThunk(
  'commitments/create',
  async (commitment: Omit<Commitment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCommitment = await commitmentsRepository.create(commitment);
    
    // Generate reminders for the new commitment
    if (newCommitment.status === CommitmentStatusEnum.ACTIVE) {
      const reminderData = generateRemindersFromCommitment(newCommitment);
      for (const data of reminderData) {
        await remindersRepository.create(data);
      }
    }
    
    return newCommitment;
  }
);

export const updateCommitment = createAsyncThunk(
  'commitments/update',
  async ({ id, updates }: { id: string; updates: Partial<Commitment> }) => {
    const updated = await commitmentsRepository.update(id, updates);
    
    // If marked as done, cancel all reminders
    if (updates.status === CommitmentStatusEnum.DONE) {
      const reminders = await remindersRepository.getByCommitmentId(id);
      for (const reminder of reminders) {
        if (reminder.status === ReminderStatusEnum.PENDING) {
          await remindersRepository.update(reminder.id, { status: ReminderStatusEnum.CANCELLED });
        }
      }
    }
    
    return updated;
  }
);

export const deleteCommitment = createAsyncThunk('commitments/delete', async (id: string) => {
  await remindersRepository.deleteByCommitmentId(id);
  await commitmentsRepository.delete(id);
  return id;
});

export const markCommitmentDone = createAsyncThunk(
  'commitments/markDone',
  async (id: string) => {
    const commitment = await commitmentsRepository.getById(id);
    if (!commitment) {
      throw new Error('Commitment not found');
    }
    
    const updated = await commitmentsRepository.update(id, { status: CommitmentStatusEnum.DONE });
    
    // Cancel all pending reminders
    const reminders = await remindersRepository.getByCommitmentId(id);
    for (const reminder of reminders) {
      if (reminder.status === ReminderStatusEnum.PENDING) {
        await remindersRepository.update(reminder.id, { status: ReminderStatusEnum.CANCELLED });
      }
    }
    
    return updated;
  }
);

const commitmentsSlice = createSlice({
  name: 'commitments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchCommitments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommitments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commitments = action.payload;
      })
      .addCase(fetchCommitments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch commitments';
      });

    // Fetch by ID
    builder
      .addCase(fetchCommitmentById.fulfilled, (state, action) => {
        const commitment = action.payload;
        if (commitment) {
          const index = state.commitments.findIndex((c) => c.id === commitment.id);
          if (index !== -1) {
            state.commitments[index] = commitment;
          } else {
            state.commitments.push(commitment);
          }
        }
      });

    // Create
    builder
      .addCase(createCommitment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCommitment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.commitments.push(action.payload);
      })
      .addCase(createCommitment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create commitment';
      });

    // Update
    builder
      .addCase(updateCommitment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCommitment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.commitments.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.commitments[index] = action.payload;
        } else {
          // If not found, add it (shouldn't happen, but handle edge case)
          state.commitments.push(action.payload);
        }
      })
      .addCase(updateCommitment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update commitment';
      })
      .addCase(markCommitmentDone.fulfilled, (state, action) => {
        const index = state.commitments.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.commitments[index] = action.payload;
        }
      });

    // Delete
    builder.addCase(deleteCommitment.fulfilled, (state, action) => {
      state.commitments = state.commitments.filter((c) => c.id !== action.payload);
    });
  },
});

export default commitmentsSlice.reducer;
