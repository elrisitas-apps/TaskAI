import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommitmentType, CommitmentSource } from '../domain/types';
import { AppStackParamList } from '../navigation/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { CommitmentStatusEnum, ReminderStatusEnum, ReminderSourceEnum } from '../constants/Enums';
import { createCommitment, updateCommitment } from '../store/slices/commitmentsSlice';
import { remindersRepository } from '../data/repositories';
import { isSameDay } from 'date-fns';
import { generateReminderLadder } from '../domain/ladder';
import { formatDate, formatDateTime } from '../utils/date';
import { semantic, overlay } from '../constants/Colors';
import { FORM_STRINGS, BUTTON_STRINGS, ERROR_STRINGS, COMMON_STRINGS } from '../constants/Strings';
import Screen from '../components/Screen';
import Button from '../components/Button';
import ReminderActionSheet from '../components/ReminderActionSheet';
import ReminderDateModal from '../components/ReminderDateModal';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type RouteProp = {
  key: string;
  name: 'ConfirmCommitment';
  params: {
    commitment: {
      type: CommitmentType;
      title: string;
      targetAt: string | null;
      source: CommitmentSource;
    };
    commitmentId?: string;
  }; 
};

export default function ConfirmCommitmentScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useColorScheme() === 'dark';
  
  const { commitment, commitmentId } = route.params;
  const isEdit = !!commitmentId;
  const targetDate = commitment.targetAt ? new Date(commitment.targetAt) : null;
  const fakeCommitment = {
    id: COMMON_STRINGS.Empty,
    type: commitment.type,
    title: commitment.title,
    targetAt: commitment.targetAt,
    status: CommitmentStatusEnum.ACTIVE,
    source: commitment.source,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ladderTarget = targetDate ?? new Date();
  const reminderDatesFromLadder = generateReminderLadder(fakeCommitment, ladderTarget);

  const maxReminders = 4;
  const [editableReminderDates, setEditableReminderDates] = useState<string[]>(() =>
    reminderDatesFromLadder.slice(0, maxReminders).map((d) => d.toISOString())
  );
  const [scheduleEditModalVisible, setScheduleEditModalVisible] = useState(false);
  const [scheduleActionSheetVisible, setScheduleActionSheetVisible] = useState(false);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number | null>(null);
  const [reminderDateModalVisible, setReminderDateModalVisible] = useState(false);
  const [reminderDateModalMode, setReminderDateModalMode] = useState<'add' | 'edit'>('add');
  const reopenScheduleModalRef = useRef(false);

  useEffect(() => {
    setEditableReminderDates(
      reminderDatesFromLadder.slice(0, maxReminders).map((d) => d.toISOString())
    );
  }, [commitment.type, commitment.targetAt]);

  const sortedEditableDates = [...editableReminderDates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const handleScheduleEdit = () => setScheduleEditModalVisible(true);
  const handleScheduleLongPress = (index: number) => {
    setSelectedScheduleIndex(index);
    setScheduleActionSheetVisible(true);
  };
  const handleScheduleSheetEdit = () => {
    setScheduleActionSheetVisible(false);
    if (selectedScheduleIndex !== null) {
      setReminderDateModalMode('edit');
      setReminderDateModalVisible(true);
    }
  };
  const handleScheduleSheetDelete = () => {
    if (selectedScheduleIndex !== null) {
      setEditableReminderDates((prev) => {
        const sorted = [...prev].sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );
        sorted.splice(selectedScheduleIndex, 1);
        return sorted;
      });
      setScheduleActionSheetVisible(false);
      setSelectedScheduleIndex(null);
    }
  };
  const handleScheduleSheetClose = () => {
    setScheduleActionSheetVisible(false);
    setSelectedScheduleIndex(null);
  };

  const handleDeleteReminderAt = (index: number) => {
    setEditableReminderDates((prev) => {
      const sorted = [...prev].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      sorted.splice(index, 1);
      return sorted;
    });
  };

  const hasReminderOnSameDay = (dateTime: Date, excludeIndex: number | null) =>
    sortedEditableDates.some(
      (iso, index) => index !== excludeIndex && isSameDay(new Date(iso), dateTime)
    );

  const handleAddReminderSave = (dateTime: Date) => {
    if (editableReminderDates.length >= maxReminders) {
      return ERROR_STRINGS.MAX_REMINDERS;
    }
    if (hasReminderOnSameDay(dateTime, null)) {
      return ERROR_STRINGS.REMINDER_SAME_DAY;
    }
    setEditableReminderDates((prev) =>
      [...prev, dateTime.toISOString()].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      )
    );
    setReminderDateModalVisible(false);
    if (reopenScheduleModalRef.current) {
      reopenScheduleModalRef.current = false;
      setScheduleEditModalVisible(true);
    }
  };
  const handleEditReminderSave = (dateTime: Date) => {
    if (selectedScheduleIndex === null) return;
    if (hasReminderOnSameDay(dateTime, selectedScheduleIndex)) {
      return ERROR_STRINGS.REMINDER_SAME_DAY;
    }
    setEditableReminderDates((prev) => {
      const sorted = [...prev].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      sorted[selectedScheduleIndex] = dateTime.toISOString();
      return sorted;
    });
    setReminderDateModalVisible(false);
    setSelectedScheduleIndex(null);
  };

  const handleConfirm = async () => {
    if (isEdit && commitmentId) {
      await dispatch(
        updateCommitment({
          id: commitmentId,
          updates: {
            type: commitment.type,
            title: commitment.title,
            targetAt: commitment.targetAt,
            source: commitment.source,
          },
        })
      );
      await remindersRepository.deleteByCommitmentId(commitmentId);
      for (const iso of sortedEditableDates) {
        await remindersRepository.create({
          commitmentId,
          scheduledAt: iso,
          status: ReminderStatusEnum.PENDING,
          source: ReminderSourceEnum.LADDER,
        });
      }
    } else {
      const result = await dispatch(
        createCommitment({
          type: commitment.type,
          title: commitment.title,
          targetAt: commitment.targetAt,
          status: CommitmentStatusEnum.ACTIVE,
          source: commitment.source,
        })
      );
      const newCommitment = result.payload as { id: string } | undefined;
      if (newCommitment?.id) {
        await remindersRepository.deleteByCommitmentId(newCommitment.id);
        for (const iso of sortedEditableDates) {
          await remindersRepository.create({
            commitmentId: newCommitment.id,
            scheduledAt: iso,
            status: ReminderStatusEnum.PENDING,
            source: ReminderSourceEnum.LADDER,
          });
        }
      }
    }
    navigation.navigate('Home');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: semantic.textSecondary(isDark) }]}>{FORM_STRINGS.TITLE}</Text>
          <Text style={[styles.value, { color: semantic.text(isDark) }]}>
            {commitment.title}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: semantic.textSecondary(isDark) }]}>{FORM_STRINGS.TYPE}</Text>
          <Text style={[styles.value, { color: semantic.text(isDark) }]}>
            {commitment.type.charAt(0).toUpperCase() + commitment.type.slice(1)}
          </Text>
        </View>

        {targetDate && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: semantic.textSecondary(isDark) }]}>
              {FORM_STRINGS.TARGET_DATE}
            </Text>
            <Text style={[styles.value, { color: semantic.text(isDark) }]}>
              {formatDate(commitment.targetAt)}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.label, { color: semantic.textSecondary(isDark) }]}>
              {FORM_STRINGS.REMINDER_SCHEDULE}
            </Text>
            <Pressable onPress={handleScheduleEdit} style={styles.editButton}>
              <Text style={[styles.editButtonText, { color: semantic.text(isDark) }]}>
                {BUTTON_STRINGS.EDIT}
              </Text>
            </Pressable>
          </View>
          {sortedEditableDates.length === 0 ? (
            <Text style={[styles.reminderDate, { color: semantic.textSecondary(isDark) }]}>
              No reminders. Tap Edit to add.
            </Text>
          ) : (
            sortedEditableDates.map((iso, index) => (
              <Text
                key={`${iso}-${index}`}
                style={[styles.reminderDate, { color: semantic.text(isDark) }]}
              >
                {formatDate(iso)}
              </Text>
            ))
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title={BUTTON_STRINGS.CANCEL}
            onPress={handleCancel}
            variant="secondary"
            style={styles.button}
          />
          <Button title={BUTTON_STRINGS.CONFIRM} onPress={handleConfirm} style={styles.button} />
        </View>
      </ScrollView>

      {scheduleEditModalVisible && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setScheduleEditModalVisible(false)}
        >
          <Pressable
            style={[styles.modalOverlay, { backgroundColor: overlay.backdrop }]}
            onPress={() => setScheduleEditModalVisible(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[styles.scheduleModalContent, { backgroundColor: semantic.surface(isDark) }]}
            >
              <View style={styles.scheduleModalHeader}>
                <Text style={[styles.scheduleModalTitle, { color: semantic.text(isDark) }]}>
                  {FORM_STRINGS.REMINDER_SCHEDULE}
                </Text>
                <TouchableOpacity
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => setScheduleEditModalVisible(false)}
                  style={styles.scheduleModalCloseBtn}
                >
                  <Text style={[styles.scheduleModalCloseBtnText, { color: semantic.text(isDark) }]}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.scheduleModalList}>
                {sortedEditableDates.map((iso, index) => (
                  <View
                    key={`${iso}-${index}`}
                    style={[styles.scheduleModalRow, { borderBottomColor: semantic.border(isDark) }]}
                  >
                    <TouchableOpacity
                      style={styles.scheduleModalRowTouchable}
                      onLongPress={() => handleScheduleLongPress(index)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.scheduleModalRowText, { color: semantic.text(isDark) }]}>
                        {formatDateTime(iso)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      onPress={() => handleDeleteReminderAt(index)}
                      style={[styles.scheduleModalDeleteBtn, { backgroundColor: semantic.surfaceSecondary(isDark) }]}
                    >
                      <Text style={[styles.scheduleModalDeleteBtnText, { color: semantic.text(isDark) }]}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <Button
                title={FORM_STRINGS.ADD_REMINDER}
                onPress={() => {
                  if (sortedEditableDates.length >= maxReminders) {
                    Alert.alert(ERROR_STRINGS.MAX_REMINDERS);
                    return;
                  }
                  reopenScheduleModalRef.current = true;
                  setScheduleEditModalVisible(false);
                  setReminderDateModalMode('add');
                  setSelectedScheduleIndex(null);
                  setReminderDateModalVisible(true);
                }}
                variant="secondary"
                style={styles.scheduleModalAddButton}
              />
              <Button
                title={BUTTON_STRINGS.CANCEL}
                onPress={() => setScheduleEditModalVisible(false)}
                variant="secondary"
                style={styles.scheduleModalDoneButton}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      <ReminderActionSheet
        visible={scheduleActionSheetVisible}
        onClose={handleScheduleSheetClose}
        onEdit={handleScheduleSheetEdit}
        onDelete={handleScheduleSheetDelete}
      />

      <ReminderDateModal
        visible={reminderDateModalVisible}
        mode={reminderDateModalMode}
        initialDateTime={
          reminderDateModalMode === 'edit' && selectedScheduleIndex !== null
            ? new Date(sortedEditableDates[selectedScheduleIndex])
            : undefined
        }
        maxDate={commitment.targetAt ? new Date(commitment.targetAt) : undefined}
        targetDateForReference={commitment.targetAt ?? undefined}
        onClose={() => {
          setReminderDateModalVisible(false);
          if (reminderDateModalMode === 'edit') setSelectedScheduleIndex(null);
          if (reopenScheduleModalRef.current) {
            reopenScheduleModalRef.current = false;
            setScheduleEditModalVisible(true);
          }
        }}
        onSave={
          reminderDateModalMode === 'add' ? handleAddReminderSave : handleEditReminderSave
        }
        onDelete={reminderDateModalMode === 'edit' ? handleScheduleSheetDelete : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
  },
  reminderDate: {
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scheduleModalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  scheduleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scheduleModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scheduleModalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleModalCloseBtnText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  scheduleModalList: {
    maxHeight: 240,
    marginBottom: 16,
  },
  scheduleModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scheduleModalRowTouchable: {
    flex: 1,
  },
  scheduleModalRowText: {
    fontSize: 15,
  },
  scheduleModalDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scheduleModalDeleteBtnText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  scheduleModalAddButton: {
    marginBottom: 8,
  },
  scheduleModalDoneButton: {
    marginBottom: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
