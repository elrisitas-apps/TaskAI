import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useColorScheme, Animated } from 'react-native';
import { ReminderActionSheetProps } from '../constants/Interfaces';
import { semantic, overlay, brand, misc } from '../constants/Colors';
import { SCREEN_TITLES, BUTTON_STRINGS } from '../constants/Strings';

export default function ReminderActionSheet({
  visible,
  onClose,
  onEdit,
  onDelete,
  title = SCREEN_TITLES.EDIT_REMINDER,
}: ReminderActionSheetProps) {
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
          <Text style={[styles.title, { color: semantic.text(isDark) }]}>
            {title}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.editButton, { backgroundColor: brand.primary }]}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>{BUTTON_STRINGS.EDIT}</Text>
          </TouchableOpacity>
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
    minHeight: 200,
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
  editButton: {},
  editButtonText: {
    color: misc.white,
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
