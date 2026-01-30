import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import onboardingReducer from './slices/onboardingSlice';
import authReducer from './slices/authSlice';
import commitmentsReducer from './slices/commitmentsSlice';

const rootReducer = combineReducers({
  onboarding: onboardingReducer,
  auth: authReducer,
  commitments: commitmentsReducer,
});

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['onboarding', 'auth', 'commitments'], // Persist onboarding, auth, and commitments
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
