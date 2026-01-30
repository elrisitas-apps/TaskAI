import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CommitmentStatusEnum } from '../constants/Enums';
import { status, misc } from '../constants/Colors';
import { BadgeProps } from '../constants/Interfaces';

export default function Badge({ label, variant = CommitmentStatusEnum.ACTIVE, style }: BadgeProps) {
  const getColor = () => {
    switch (variant) {
      case CommitmentStatusEnum.ACTIVE:
        return status.active;
      case CommitmentStatusEnum.DONE:
        return status.done;
      case CommitmentStatusEnum.EXPIRED:
        return status.expired;
      default:
        return status.neutral;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: misc.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
