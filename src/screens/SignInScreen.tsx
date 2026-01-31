import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, useColorScheme } from 'react-native';
import { isIos } from '../constants/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { signIn, signInWithGoogle } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { semantic, brand, misc } from '../constants/Colors';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Input from '../components/Input';
import { AUTH_STRINGS, FORM_STRINGS, COMMON_STRINGS } from '../constants/Strings';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignInScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const isDark = useColorScheme() === 'dark';
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState(COMMON_STRINGS.Empty);
  const [password, setPassword] = useState(COMMON_STRINGS.Empty);

  const handleSignIn = async () => {
    await dispatch(signIn({ email, password }));
  };

  const handleGoogleSignIn = async () => {
    await dispatch(signInWithGoogle());
  };

  const handleSignUp = () => {
    (navigation as any).navigate('Auth', { screen: 'SignUp' });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={isIos ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: semantic.text(isDark) }]}>
              {AUTH_STRINGS.WELCOME_BACK}
            </Text>
            <Text style={[styles.subtitle, { color: semantic.textSecondary(isDark) }]}>
              {AUTH_STRINGS.SIGN_IN_TO_CONTINUE}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={FORM_STRINGS.EMAIL}
              value={email}
              onChangeText={setEmail}
              placeholder={FORM_STRINGS.ENTER_EMAIL}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label={FORM_STRINGS.PASSWORD}
              value={password}
              onChangeText={setPassword}
              placeholder={FORM_STRINGS.ENTER_PASSWORD}
              secureTextEntry
              autoCapitalize="none"
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button
              title={AUTH_STRINGS.SIGN_IN}
              onPress={handleSignIn}
              loading={isLoading}
              style={styles.button}
            />
            <Button
              title={AUTH_STRINGS.SIGN_IN_WITH_GOOGLE}
              onPress={handleGoogleSignIn}
              variant="secondary"
              loading={isLoading}
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: semantic.textSecondary(isDark) }]}>
              {AUTH_STRINGS.DONT_HAVE_ACCOUNT}{' '}
            </Text>
            <Text
              style={[styles.link, { color: brand.link }]}
              onPress={handleSignUp}
            >
              {AUTH_STRINGS.SIGN_UP}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  error: {
    color: misc.error,
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
