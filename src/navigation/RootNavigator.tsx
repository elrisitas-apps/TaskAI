import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadSession } from '../store/slices/authSlice';
import { fetchCommitments } from '../store/slices/commitmentsSlice';
import { RootStackParamList, AppStackParamList, AuthStackParamList } from './types';
import { SCREEN_TITLES } from '../constants/Strings';
import { semantic, brand } from '../constants/Colors';
import OnboardingCarouselScreen from '../screens/OnboardingCarouselScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ExpiredScreen from '../screens/ExpiredScreen';
import AddEditCommitmentScreen from '../screens/AddEditCommitmentScreen';
import CommitmentDetailScreen from '../screens/CommitmentDetailScreen';
import ConfirmCommitmentScreen from '../screens/ConfirmCommitmentScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AppNavigator() {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: semantic.background(isDark),
        },
        headerTintColor: brand.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: semantic.text(isDark),
        },
      }}
    >
      <AppStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="Expired"
        component={ExpiredScreen}
        options={{
          title: SCREEN_TITLES.EXPIRED,
        }}
      />
      <AppStack.Screen
        name="AddEditCommitment"
        component={AddEditCommitmentScreen}
        options={({ route }) => ({
          title: route.params?.commitmentId ? SCREEN_TITLES.EDIT_COMMITMENT : SCREEN_TITLES.NEW_COMMITMENT,
        })}
      />
      <AppStack.Screen
        name="CommitmentDetail"
        component={CommitmentDetailScreen}
        options={{
          title: SCREEN_TITLES.COMMITMENT_DETAILS,
        }}
      />
      <AppStack.Screen
        name="ConfirmCommitment"
        component={ConfirmCommitmentScreen}
        options={{
          title: SCREEN_TITLES.CONFIRM_COMMITMENT,
        }}
      />
    </AppStack.Navigator>
  );
}

function AuthNavigator() {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: semantic.background(isDark),
        },
        headerTintColor: brand.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: semantic.text(isDark),
        },
      }}
    >
      <AuthStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          title: SCREEN_TITLES.SIGN_UP,
        }}
      />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const hasSeenOnboarding = useSelector((state: RootState) => state.onboarding.hasSeenOnboarding);
  const session = useSelector((state: RootState) => state.auth.session);

  useEffect(() => {
    // Load session on app start
    dispatch(loadSession());
  }, [dispatch]);

  useEffect(() => {
    // Fetch commitments when authenticated
    // The mock repository now persists to AsyncStorage, so it will have the saved data
    if (session) {
      dispatch(fetchCommitments());
    }
  }, [session, dispatch]);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <RootStack.Screen name="Onboarding" component={OnboardingCarouselScreen} />
        ) : !session ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="App" component={AppNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
