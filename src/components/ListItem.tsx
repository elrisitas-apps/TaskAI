import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { semantic, shadow } from '../constants/Colors';
import { isIos } from '../constants/Layout';
import Badge from './Badge';
import { ListItemProps } from '../constants/Interfaces';

export default function ListItem({
  title,
  subtitle,
  primarySubtitle,
  secondarySubtitle,
  badge,
  accentColor,
  onPress,
  onLongPress,
  rightElement,
  style,
}: ListItemProps) {
  const isDark = useColorScheme() === 'dark';
  const Component = onPress || onLongPress ? TouchableOpacity : View;
  const usePrimarySecondary = primarySubtitle != null;

  return (
    <Component
      style={[
        styles.container,
        { backgroundColor: semantic.surface(isDark) },
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : undefined,
        isIos
          ? {
              shadowColor: shadow.color,
              shadowOffset: shadow.offset,
              shadowOpacity: shadow.opacity,
              shadowRadius: shadow.radius,
            }
          : { elevation: shadow.elevation },
        style,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.textContainer, usePrimarySecondary && styles.textContainerWithSecondary]}>
          <Text style={[styles.title, { color: semantic.text(isDark) }]}>{title}</Text>
          {usePrimarySecondary ? (
            secondarySubtitle ? (
              <>
                <Text style={[styles.primarySubtitle, { color: semantic.textSubtitle(isDark) }]}>
                  {primarySubtitle}
                </Text>
                <Text style={[styles.secondarySubtitle, { color: semantic.textSecondary(isDark) }]}>
                  {secondarySubtitle}
                </Text>
              </>
            ) : (
              <View style={styles.primarySubtitleCenter}>
                <Text style={[styles.primarySubtitle, { color: semantic.textSubtitle(isDark) }]}>
                  {primarySubtitle}
                </Text>
              </View>
            )
          ) : subtitle ? (
            <Text style={[styles.subtitle, { color: semantic.textSecondary(isDark) }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge && <Badge label={badge.label} variant={badge.variant} />}
      </View>
      {rightElement && <View style={styles.right}>{rightElement}</View>}
    </Component>
  );
}

// When primarySubtitle is used (e.g. Active list), reserve space for title + target line + reminder line so all rows have the same height.
const TEXT_BLOCK_MIN_HEIGHT = 58;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  textContainerWithSecondary: {
    minHeight: TEXT_BLOCK_MIN_HEIGHT,
  },
  primarySubtitleCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
  },
  primarySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
  },
  secondarySubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  right: {
    marginLeft: 12,
  },
});
