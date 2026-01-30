import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useColorScheme, Animated } from 'react-native';
import { ActionSheetProps } from '../constants/Interfaces';
import { BUTTON_STRINGS, COMMON_STRINGS } from '../constants/Strings';
import { semantic, overlay, misc, status } from '../constants/Colors';

export default function ActionSheet({
  visible,
  onClose,
  onDelete,
  onMarkDone,
  title,
}: ActionSheetProps) {
  const isDark = useColorScheme() === 'dark';
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: overlay.backdrop }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: semantic.surface(isDark) },
            { transform: [{ translateY: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.handle, { backgroundColor: overlay.handle }]} />
          {title != null && title !== COMMON_STRINGS.Empty ? (
            <Text style={[styles.title, { color: semantic.text(isDark) }]}>{title}</Text>
          ) : null}
          {onMarkDone ? (
            <TouchableOpacity
              style={[styles.button, styles.markDoneButton, { backgroundColor: status.done }]}
              onPress={onMarkDone}
              activeOpacity={0.7}
            >
              <Text style={[styles.markDoneButtonText, { color: misc.white }]}>
                {BUTTON_STRINGS.MARK_AS_DONE}
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>{BUTTON_STRINGS.DELETE}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { backgroundColor: semantic.surfaceSecondary(isDark) }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelButtonText, { color: semantic.text(isDark) }]}>
              {BUTTON_STRINGS.CANCEL}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    minHeight: 160,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  markDoneButton: {},
  markDoneButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: misc.error,
  },
  deleteButtonText: {
    color: misc.white,
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    marginBottom: 0,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
