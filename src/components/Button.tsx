import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import { button as buttonColors, misc } from '../constants/Colors';
import { ButtonProps } from '../constants/Interfaces';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDark = useColorScheme() === 'dark';

  const getButtonStyle = (): ViewStyle => {
    if (disabled || loading) {
      return { backgroundColor: buttonColors.disabledBg(isDark) };
    }
    switch (variant) {
      case 'primary':
        return { backgroundColor: buttonColors.primary };
      case 'secondary':
        return { backgroundColor: buttonColors.secondaryBg(isDark) };
      case 'danger':
        return { backgroundColor: buttonColors.danger };
      default:
        return { backgroundColor: buttonColors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    if (disabled || loading) {
      return { color: buttonColors.disabledText(isDark) };
    }
    switch (variant) {
      case 'primary':
      case 'danger':
        return { color: misc.white };
      case 'secondary':
        return { color: buttonColors.secondaryText(isDark) };
      default:
        return { color: misc.white };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
