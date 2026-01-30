import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ReminderDateModalProps } from '../constants/Interfaces';
import { semantic, overlay, misc } from '../constants/Colors';
import { FORM_STRINGS, BUTTON_STRINGS, SCREEN_TITLES, ERROR_STRINGS, COMMON_STRINGS } from '../constants/Strings';
import Input from './Input';
import Button from './Button';
import { format, parse, parseISO } from 'date-fns';

const DATE_FORMAT = FORM_STRINGS.DATE_FORMAT;
const DATE_FORMAT_DISPLAY = FORM_STRINGS.DATE_FORMAT;
const TIME_FORMAT = FORM_STRINGS.TIME_FORMAT;

export default function ReminderDateModal({
  visible,
  mode,
  initialDateTime,
  maxDate,
  targetDateForReference,
  onClose,
  onSave,
  onDelete,
}: ReminderDateModalProps) {
  const isDark = useColorScheme() === 'dark';
  const defaultDate = initialDateTime ?? new Date();
  const [dateInput, setDateInput] = useState(format(defaultDate, DATE_FORMAT));
  const [timeInput, setTimeInput] = useState(format(defaultDate, TIME_FORMAT));
  const [error, setError] = useState<string>(COMMON_STRINGS.Empty);

  useEffect(() => {
    if (visible) {
      const d = initialDateTime ?? new Date();
      setDateInput(format(d, DATE_FORMAT));
      setTimeInput(format(d, TIME_FORMAT));
      setError(COMMON_STRINGS.Empty);
    }
  }, [visible, initialDateTime]);

  const handleSave = async () => {
    const dateMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const timeParts = timeInput.trim().split(':');
    const hour = timeParts[0]?.replace(/\s/g, COMMON_STRINGS.Empty).padStart(2, '0') ?? '00';
    const min = timeParts[1]?.replace(/\s/g, COMMON_STRINGS.Empty).padStart(2, '0') ?? '00';
    const timeStr = `${hour}:${min}`;
    if (!dateMatch) {
      setError(ERROR_STRINGS.DATE_MUST_BE_FORMAT(DATE_FORMAT));
      return;
    }
    if (!/^\d{1,2}:\d{0,2}$/.test(timeInput.trim()) && !/^\d{2}:\d{2}$/.test(timeStr)) {
      setError(ERROR_STRINGS.TIME_MUST_BE_FORMAT(TIME_FORMAT));
      return;
    }
    const dateTime = parse(
      `${dateInput}T${timeStr}`,
      "yyyy-MM-dd'T'HH:mm",
      new Date()
    );
    if (isNaN(dateTime.getTime())) {
      setError(ERROR_STRINGS.INVALID_DATE_TIME);
      return;
    }
    if (dateTime <= new Date()) {
      setError(ERROR_STRINGS.DATE_TIME_MUST_BE_FUTURE);
      return;
    }
    if (maxDate != null && dateTime.getTime() > maxDate.getTime()) {
      setError(ERROR_STRINGS.REMINDER_AFTER_TARGET);
      return;
    }
    setError(COMMON_STRINGS.Empty);
    const result = await onSave(dateTime);
    if (typeof result === 'string') {
      setError(result);
      return;
    }
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: overlay.backdrop }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centered}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.container, { backgroundColor: semantic.surface(isDark) }]}
          >
            <Text style={[styles.title, { color: semantic.text(isDark) }]}>
              {mode === 'add' ? SCREEN_TITLES.ADD_SNOOZE : SCREEN_TITLES.EDIT_REMINDER}
            </Text>
            {mode === 'add' && targetDateForReference ? (
              <Text style={[styles.targetDateRef, { color: semantic.textSecondary(isDark) }]}>
                {FORM_STRINGS.TARGET_DATE}: {format(parseISO(targetDateForReference), DATE_FORMAT_DISPLAY)}
              </Text>
            ) : null}
            <Input
              label={FORM_STRINGS.REMINDER_DATE}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder={DATE_FORMAT}
              containerStyle={styles.input}
            />
            <Input
              label={FORM_STRINGS.REMINDER_TIME}
              value={timeInput}
              onChangeText={setTimeInput}
              placeholder={TIME_FORMAT}
              containerStyle={styles.input}
            />
            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}
            <View style={styles.buttons}>
              <Button
                title={BUTTON_STRINGS.CONFIRM}
                onPress={handleSave}
                variant="primary"
                style={styles.button}
              />
              {mode === 'edit' && onDelete ? (
                <Button
                  title={BUTTON_STRINGS.DELETE}
                  onPress={handleDelete}
                  variant="danger"
                  style={styles.button}
                />
              ) : null}
              <Button
                title={BUTTON_STRINGS.CANCEL}
                onPress={onClose}
                variant="secondary"
                style={styles.button}
              />
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    width: '100%',
    padding: 24,
  },
  container: {
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  targetDateRef: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: misc.error,
    fontSize: 14,
    marginBottom: 12,
  },
  buttons: {
    marginTop: 8,
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});
