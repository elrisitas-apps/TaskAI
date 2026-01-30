import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { markCommitmentDone } from '../store/slices/commitmentsSlice';
import { CommitmentStatusEnum, ReminderStatusEnum, ReminderSourceEnum } from '../constants/Enums';
import { remindersRepository } from '../data/repositories';
import { generateRemindersFromCommitment } from '../domain/ladder';
import { Reminder } from '../domain/types';
import { formatDate, formatDateTime } from '../utils/date';
import { formatISO, isSameDay } from 'date-fns';
import { semantic, overlay } from '../constants/Colors';
import { FORM_STRINGS, BUTTON_STRINGS, EMPTY_STATE_STRINGS, ALERT_STRINGS, ERROR_STRINGS } from '../constants/Strings';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ReminderActionSheet from '../components/ReminderActionSheet';
import ReminderDateModal from '../components/ReminderDateModal';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type RouteProp = {
  key: string;
  name: 'CommitmentDetail';
  params: { commitmentId: string };
};

export default function CommitmentDetailScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useColorScheme() === 'dark';
  const { commitments } = useSelector((state: RootState) => state.commitments);
  
  const commitment = commitments.find((c) => c.id === route.params.commitmentId);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderSheetVisible, setReminderSheetVisible] = useState(false);
  const [reminderDateModalVisible, setReminderDateModalVisible] = useState(false);
  const [reminderDateModalMode, setReminderDateModalMode] = useState<'add' | 'edit'>('add');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [scheduleEditModalVisible, setScheduleEditModalVisible] = useState(false);
  const reopenScheduleModalRef = useRef(false);

  useEffect(() => {
    if (commitment) {
      loadReminders();
    }
  }, [commitment]);

  const loadReminders = async () => {
    if (!commitment) return;
    const commitmentReminders = await remindersRepository.getByCommitmentId(commitment.id);
    setReminders(commitmentReminders);
  };

  const snoozeCount = reminders.filter((r) => r.source === ReminderSourceEnum.SNOOZE).length;
  const maxSnoozes = 3;
  const pendingReminders = reminders.filter((r) => r.status === ReminderStatusEnum.PENDING);
  const pendingRemindersCount = pendingReminders.length;
  const maxReminders = 4;

  const hasSnoozeOnSameDay = (dateTime: Date, excludeReminderId?: string) =>
    reminders.some(
      (r) =>
        r.source === ReminderSourceEnum.SNOOZE &&
        r.status === ReminderStatusEnum.PENDING &&
        r.id !== excludeReminderId &&
        isSameDay(new Date(r.scheduledAt), dateTime)
    );

  const handleMarkDone = async () => {
    if (!commitment) return;
    Alert.alert(ALERT_STRINGS.MARK_AS_DONE_TITLE, ALERT_STRINGS.MARK_AS_DONE_MESSAGE, [
      { text: BUTTON_STRINGS.CANCEL, style: 'cancel' },
      {
        text: ALERT_STRINGS.MARK_DONE,
        onPress: async () => {
          await dispatch(markCommitmentDone(commitment.id));
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAddSnooze = () => {
    if (!commitment || snoozeCount >= maxSnoozes) return;
    if (pendingRemindersCount >= maxReminders) {
      Alert.alert(ERROR_STRINGS.MAX_REMINDERS);
      return;
    }
    setReminderDateModalMode('add');
    setSelectedReminder(null);
    setReminderDateModalVisible(true);
  };

  const handleAddSnoozeSave = async (dateTime: Date) => {
    if (!commitment) return;
    if (pendingRemindersCount >= maxReminders) return ERROR_STRINGS.MAX_REMINDERS;
    if (hasSnoozeOnSameDay(dateTime)) return ERROR_STRINGS.SNOOZE_SAME_DAY;
    await remindersRepository.create({
      commitmentId: commitment.id,
      scheduledAt: formatISO(dateTime),
      status: ReminderStatusEnum.PENDING,
      source: ReminderSourceEnum.SNOOZE,
    });
    await loadReminders();
    if (reopenScheduleModalRef.current) {
      reopenScheduleModalRef.current = false;
      setScheduleEditModalVisible(true);
    }
  };

  const handleReminderLongPress = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setReminderSheetVisible(true);
  };

  const handleReminderSheetEdit = () => {
    setReminderSheetVisible(false);
    if (selectedReminder) {
      setReminderDateModalMode('edit');
      setReminderDateModalVisible(true);
    }
  };

  const handleReminderSheetDelete = async () => {
    if (selectedReminder) {
      await remindersRepository.delete(selectedReminder.id);
      setReminderSheetVisible(false);
      setSelectedReminder(null);
      await loadReminders();
    }
  };

  const handleReminderSheetClose = () => {
    setReminderSheetVisible(false);
    setSelectedReminder(null);
  };

  const handleScheduleEdit = () => setScheduleEditModalVisible(true);
  const handleDeleteReminderInModal = async (reminder: Reminder) => {
    await remindersRepository.delete(reminder.id);
    await loadReminders();
  };
  const sortedPendingReminders = [...pendingReminders].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const otherPendingReminders = reminders.filter(
    (r) =>
      r.status === ReminderStatusEnum.PENDING && r.id !== selectedReminder?.id
  );
  const hasRemindersLaterThan = (dateTime: Date) =>
    otherPendingReminders.some(
      (r) => new Date(r.scheduledAt).getTime() > dateTime.getTime()
    );

  const handleRegenerateRemindersForCommitment = async () => {
    if (!commitment) return;
    const allReminders = await remindersRepository.getByCommitmentId(commitment.id);
    for (const r of allReminders) {
      if (r.status === ReminderStatusEnum.PENDING) {
        await remindersRepository.delete(r.id);
      }
    }
    const reminderData = generateRemindersFromCommitment(commitment);
    for (const data of reminderData) {
      await remindersRepository.create(data);
    }
    await loadReminders();
    setReminderDateModalVisible(false);
    setSelectedReminder(null);
  };

  const handleReminderDateEditSave = async (dateTime: Date) => {
    if (!selectedReminder || !commitment) return;
    if (
      selectedReminder.source === ReminderSourceEnum.SNOOZE &&
      hasSnoozeOnSameDay(dateTime, selectedReminder.id)
    ) {
      return ERROR_STRINGS.SNOOZE_SAME_DAY;
    }
    if (hasRemindersLaterThan(dateTime)) {
      Alert.alert(
        ALERT_STRINGS.REMINDERS_PAST_DATE_TITLE,
        ALERT_STRINGS.REMINDERS_PAST_DATE_MESSAGE,
        [
          { text: BUTTON_STRINGS.CANCEL, style: 'cancel' },
          {
            text: ALERT_STRINGS.ADJUST_REMINDERS,
            onPress: async () => {
              await handleRegenerateRemindersForCommitment();
            },
          },
        ]
      );
      return;
    }
    await remindersRepository.update(selectedReminder.id, {
      scheduledAt: formatISO(dateTime),
    });
    setSelectedReminder({ ...selectedReminder, scheduledAt: formatISO(dateTime) });
    await loadReminders();
  };

  const handleReminderDateEditDelete = async () => {
    if (!selectedReminder) return;
    await remindersRepository.delete(selectedReminder.id);
    setSelectedReminder(null);
    await loadReminders();
  };

  const handleEdit = () => {
    if (!commitment) return;
    navigation.navigate('AddEditCommitment', { commitmentId: commitment.id });
  };

  if (!commitment) {
    return (
      <Screen>
        <View style={styles.container}>
          <Text style={[styles.error, { color: semantic.text(isDark) }]}>
            {EMPTY_STATE_STRINGS.COMMITMENT_NOT_FOUND}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: semantic.text(isDark) }]}>
            {commitment.title}
          </Text>
          <Badge
            label={commitment.status.charAt(0).toUpperCase() + commitment.status.slice(1)}
            variant={commitment.status}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: semantic.textSecondary(isDark) }]}>{FORM_STRINGS.TYPE}</Text>
          <Text style={[styles.value, { color: semantic.text(isDark) }]}>
            {commitment.type.charAt(0).toUpperCase() + commitment.type.slice(1)}
          </Text>
        </View>

        {commitment.targetAt && (
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
          <Text style={[styles.label, { color: semantic.textSecondary(isDark) }]}>
            {FORM_STRINGS.CREATED_AT}
          </Text>
          <Text style={[styles.value, { color: semantic.text(isDark) }]}>
            {formatDateTime(commitment.createdAt)}
          </Text>
        </View>

        {commitment.status === CommitmentStatusEnum.ACTIVE && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.label, { color: semantic.textSecondary(isDark) }]}>
                {FORM_STRINGS.UPCOMING_REMINDERS}
              </Text>
              <Pressable onPress={handleScheduleEdit} style={styles.editButton}>
                <Text style={[styles.editButtonText, { color: semantic.text(isDark) }]}>
                  {BUTTON_STRINGS.EDIT}
                </Text>
              </Pressable>
            </View>
            {sortedPendingReminders.length === 0 ? (
              <Text style={[styles.reminderDate, { color: semantic.textSecondary(isDark) }]}>
                No reminders. Tap Edit to add.
              </Text>
            ) : (
              sortedPendingReminders.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  style={styles.reminderItem}
                  onLongPress={() => handleReminderLongPress(reminder)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.reminderDate, { color: semantic.text(isDark) }]}>
                    {formatDateTime(reminder.scheduledAt)}
                  </Text>
                  <Badge
                    label={reminder.source === ReminderSourceEnum.SNOOZE ? FORM_STRINGS.SNOOZE_LABEL : reminder.status}
                    variant="active"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {commitment.status === CommitmentStatusEnum.ACTIVE && (
          <View style={styles.actions}>
            {snoozeCount < maxSnoozes && pendingRemindersCount < maxReminders ? (
              <Button
                title={BUTTON_STRINGS.ADD_A_REMINDER}
                onPress={handleAddSnooze}
                variant="secondary"
                style={styles.actionButton}
              />
            ) : (
              <Text style={[styles.snoozeLimitHint, { color: semantic.textSecondary(isDark) }]}>
                {pendingRemindersCount >= maxReminders
                  ? ERROR_STRINGS.MAX_REMINDERS
                  : FORM_STRINGS.SNOOZE_LIMIT_REACHED}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          {commitment.status === CommitmentStatusEnum.ACTIVE && (
            <Button
              title={BUTTON_STRINGS.MARK_AS_DONE}
              onPress={handleMarkDone}
              variant="primary"
              style={styles.actionButton}
            />
          )}
          <Button
            title={BUTTON_STRINGS.EDIT}
            onPress={handleEdit}
            variant="secondary"
            style={styles.actionButton}
          />
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
                  {FORM_STRINGS.UPCOMING_REMINDERS}
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
                {sortedPendingReminders.map((reminder) => (
                  <View
                    key={reminder.id}
                    style={[styles.scheduleModalRow, { borderBottomColor: semantic.border(isDark) }]}
                  >
                    <TouchableOpacity
                      style={styles.scheduleModalRowTouchable}
                      onLongPress={() => handleReminderLongPress(reminder)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.scheduleModalRowText, { color: semantic.text(isDark) }]}>
                        {formatDateTime(reminder.scheduledAt)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      onPress={() => handleDeleteReminderInModal(reminder)}
                      style={[
                        styles.scheduleModalDeleteBtn,
                        { backgroundColor: semantic.surfaceSecondary(isDark) },
                      ]}
                    >
                      <Text
                        style={[styles.scheduleModalDeleteBtnText, { color: semantic.text(isDark) }]}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <Button
                title={FORM_STRINGS.ADD_REMINDER}
                onPress={() => {
                  if (pendingRemindersCount >= maxReminders) {
                    Alert.alert(ERROR_STRINGS.MAX_REMINDERS);
                    return;
                  }
                  if (snoozeCount >= maxSnoozes) {
                    Alert.alert(FORM_STRINGS.SNOOZE_LIMIT_REACHED);
                    return;
                  }
                  reopenScheduleModalRef.current = true;
                  setScheduleEditModalVisible(false);
                  setReminderDateModalMode('add');
                  setSelectedReminder(null);
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
        visible={reminderSheetVisible}
        onClose={handleReminderSheetClose}
        onEdit={handleReminderSheetEdit}
        onDelete={handleReminderSheetDelete}
      />

      <ReminderDateModal
        visible={reminderDateModalVisible}
        mode={reminderDateModalMode}
        initialDateTime={
          reminderDateModalMode === 'edit' && selectedReminder
            ? new Date(selectedReminder.scheduledAt)
            : undefined
        }
        maxDate={commitment?.targetAt ? new Date(commitment.targetAt) : undefined}
        targetDateForReference={commitment?.targetAt ?? undefined}
        onClose={() => {
          setReminderDateModalVisible(false);
          if (reminderDateModalMode === 'edit') setSelectedReminder(null);
          if (reopenScheduleModalRef.current) {
            reopenScheduleModalRef.current = false;
            setScheduleEditModalVisible(true);
          }
        }}
        onSave={
          reminderDateModalMode === 'add'
            ? handleAddSnoozeSave
            : handleReminderDateEditSave
        }
        onDelete={
          reminderDateModalMode === 'edit' ? handleReminderDateEditDelete : undefined
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
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
  value: {
    fontSize: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reminderDate: {
    fontSize: 14,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  snoozeLimitHint: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
