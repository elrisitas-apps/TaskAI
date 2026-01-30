import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { semantic } from '../constants/Colors';
import { ScreenProps } from '../constants/Interfaces';

export default function Screen({ children, style }: ScreenProps) {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: semantic.background(isDark) },
        style,
      ]}
      edges={['top', 'bottom']}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
