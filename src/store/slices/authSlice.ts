import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthSession, AuthState } from '../../constants/Interfaces';
import { authRepository } from '../../data/repositories';

const initialState: AuthState = {
  session: null,
  isLoading: false,
  error: null,
};

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    return await authRepository.signIn(email, password);
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    return await authRepository.signUp(email, password, name);
  }
);

export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', async () => {
  return await authRepository.signInWithGoogle();
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await authRepository.signOut();
});

export const loadSession = createAsyncThunk('auth/loadSession', async () => {
  return await authRepository.getCurrentSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Sign in
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      });

    // Sign up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign up failed';
      });

    // Sign in with Google
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Google sign in failed';
      });

    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.session = null;
      });

    // Load session
    builder.addCase(loadSession.fulfilled, (state, action) => {
      state.session = action.payload;
    });
  },
});

export default authSlice.reducer;
