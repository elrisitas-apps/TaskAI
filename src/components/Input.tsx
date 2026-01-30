import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { semantic, misc } from '../constants/Colors';
import { InputProps } from '../constants/Interfaces';

export default function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: semantic.text(isDark) }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: semantic.surfaceSecondary(isDark),
            color: semantic.text(isDark),
            borderColor: error ? misc.error : 'transparent',
            borderWidth: error ? 1 : 0,
          },
          style,
        ]}
        placeholderTextColor={semantic.placeholder(isDark)}
        {...props}
      />
      {error && <Text style={[styles.error, { color: misc.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
