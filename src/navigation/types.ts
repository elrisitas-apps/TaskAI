import { NavigatorScreenParams } from '@react-navigation/native';
import type { CommitmentType, CommitmentSource } from '../domain/types';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

export type AppStackParamList = {
  Home: undefined;
  Expired: undefined;
  AddEditCommitment: {
    commitmentId?: string;
    /** Pre-fill form (e.g. from AI). Used when commitmentId is absent. */
    initialCommitment?: {
      type: CommitmentType;
      title: string;
      description?: string | null;
      targetAt: string | null;
    };
  };
  CommitmentDetail: { commitmentId: string };
  ConfirmCommitment: {
    commitment: {
      type: CommitmentType;
      title: string;
      description?: string | null;
      targetAt: string | null;
      source: CommitmentSource;
    };
    commitmentId?: string;
  };
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};
