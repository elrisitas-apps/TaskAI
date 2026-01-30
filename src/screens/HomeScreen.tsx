import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { AppDispatch, RootState } from '../store';
import { fetchCommitments, deleteCommitment, markCommitmentDone } from '../store/slices/commitmentsSlice';
import { CommitmentStatusEnum, CommitmentTypeEnum, ReminderStatusEnum } from '../constants/Enums';
import { remindersRepository } from '../data/repositories';
import { sortByTargetDate } from '../domain/urgency';
import { formatDate, formatRelative, daysUntil, getUrgencyBand } from '../utils/date';
import { urgency as urgencyColors, semantic, misc, brand } from '../constants/Colors';
import Screen from '../components/Screen';
import ListItem from '../components/ListItem';
import ActionSheet from '../components/ActionSheet';
import { Reminder, Commitment } from '../domain/types';
import { SCREEN_TITLES, EMPTY_STATE_STRINGS, FORM_STRINGS, HOME_SECTIONS, COMMON_STRINGS, STATUS_LABELS } from '../constants/Strings';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const isDark = useColorScheme() === 'dark';
  const { commitments, isLoading } = useSelector((state: RootState) => state.commitments);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);

  const active = commitments.filter((c) => c.status === CommitmentStatusEnum.ACTIVE);
  const done = commitments.filter((c) => c.status === CommitmentStatusEnum.DONE);
  const expired = commitments.filter((c) => c.status === CommitmentStatusEnum.EXPIRED);
  const sortedActive = sortByTargetDate(active);

  useEffect(() => {
    dispatch(fetchCommitments());
    loadReminders();
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      loadReminders();
    }, [])
  );

  const loadReminders = async () => {
    const allReminders = await remindersRepository.getAll();
    setReminders(allReminders);
  };

  const getNextReminderDate = (commitmentId: string): string | null => {
    const commitmentReminders = reminders
      .filter((r) => r.commitmentId === commitmentId && r.status === ReminderStatusEnum.PENDING)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return commitmentReminders[0]?.scheduledAt ?? null;
  };

  /** Days until the date used for urgency color: target date for dated tasks, next reminder for open-ended. */
  const getDaysUntilForUrgency = (item: Commitment): number | null => {
    if (item.targetAt) return daysUntil(item.targetAt);
    const nextReminder = getNextReminderDate(item.id);
    if (nextReminder) return daysUntil(nextReminder);
    return null;
  };

  const getUrgencyColor = (item: Commitment): string => {
    const days = getDaysUntilForUrgency(item);
    // Open-ended with no date/reminder (or far out) → green; otherwise use band by target/reminder
    if (item.type === CommitmentTypeEnum.OPEN && (days === null || days >= 30)) return urgencyColors.ok;
    const band = getUrgencyBand(days);
    if (band === 'urgent') return urgencyColors.urgent;
    if (band === 'soon') return urgencyColors.soon;
    return urgencyColors.ok;
  };

  const lastNonOpenEndedActiveIndex = (() => {
    let idx = -1;
    sortedActive.forEach((item, i) => {
      if (item.type !== CommitmentTypeEnum.OPEN) idx = i;
    });
    return idx;
  })();

  const handleAddCommitment = () => navigation.navigate('AddEditCommitment', {});
  const handleCommitmentPress = (commitmentId: string) =>
    navigation.navigate('CommitmentDetail', { commitmentId });
  const handleCommitmentLongPress = (commitmentId: string) => {
    setSelectedCommitmentId(commitmentId);
    setActionSheetVisible(true);
  };
  const handleMarkDone = async () => {
    if (selectedCommitmentId) {
      await dispatch(markCommitmentDone(selectedCommitmentId));
      setActionSheetVisible(false);
      setSelectedCommitmentId(null);
      loadReminders();
    }
  };
  const handleDelete = async () => {
    if (selectedCommitmentId) {
      await dispatch(deleteCommitment(selectedCommitmentId));
      setActionSheetVisible(false);
      setSelectedCommitmentId(null);
      loadReminders();
    }
  };
  const handleCancel = () => {
    setActionSheetVisible(false);
    setSelectedCommitmentId(null);
  };

  const renderActiveItem = (item: Commitment) => {
    const targetLine = item.targetAt
      ? `${FORM_STRINGS.TARGET_DATE_LABEL}${formatDate(item.targetAt)}`
      : FORM_STRINGS.OPEN_ENDED;
    const nextReminder = getNextReminderDate(item.id);
    const relativeText = nextReminder ? formatRelative(nextReminder) : COMMON_STRINGS.Empty;
    const reminderLine = relativeText
      ? `${FORM_STRINGS.REMINDER_LABEL}${relativeText.charAt(0).toUpperCase()}${relativeText.slice(1)}`
      : COMMON_STRINGS.Empty;
    return (
      <ListItem
        key={item.id}
        title={item.title}
        primarySubtitle={targetLine}
        secondarySubtitle={reminderLine || undefined}
        badge={{ label: STATUS_LABELS.ACTIVE, variant: CommitmentStatusEnum.ACTIVE }}
        accentColor={getUrgencyColor(item)}
        onPress={() => handleCommitmentPress(item.id)}
        onLongPress={() => handleCommitmentLongPress(item.id)}
      />
    );
  };

  const renderDoneItem = (item: Commitment) => {
    const subtitle = item.targetAt ? formatDate(item.targetAt) : undefined;
    return (
      <ListItem
        key={item.id}
        title={item.title}
        subtitle={subtitle}
        badge={{ label: STATUS_LABELS.DONE, variant: CommitmentStatusEnum.DONE }}
        onPress={() => handleCommitmentPress(item.id)}
        onLongPress={() => handleCommitmentLongPress(item.id)}
        style={styles.doneItem}
      />
    );
  };

  const isEmpty = commitments.length === 0;
  const hasActive = sortedActive.length > 0;
  const hasDone = done.length > 0;
  const hasExpired = expired.length > 0;

  return (
    <Screen>
      <View style={[styles.header, { borderBottomColor: semantic.border(isDark) }]}>
        <Text style={[styles.title, { color: semantic.text(isDark) }]}>
          {SCREEN_TITLES.HOME}
        </Text>
      </View>

      {isLoading && isEmpty ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: semantic.textSecondary(isDark) }]}>
            {EMPTY_STATE_STRINGS.LOADING}
          </Text>
        </View>
      ) : isEmpty ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: semantic.textSecondary(isDark) }]}>
            {EMPTY_STATE_STRINGS.NO_COMMITMENTS}
          </Text>
          <Text style={[styles.emptySubtext, { color: semantic.textSecondary(isDark) }]}>
            {EMPTY_STATE_STRINGS.NO_COMMITMENTS_SUBTEXT}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {hasActive && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: semantic.text(isDark) }]}>
                {HOME_SECTIONS.ACTIVE}
              </Text>
              {sortedActive.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderActiveItem(item)}
                  {index === lastNonOpenEndedActiveIndex && lastNonOpenEndedActiveIndex >= 0 && (
                    <View
                      style={[
                        styles.openEndedSeparator,
                        { borderTopColor: semantic.border(isDark) },
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          )}

          {hasDone && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitleMuted, { color: semantic.textSecondary(isDark) }]}>
                {HOME_SECTIONS.DONE}
              </Text>
              {done.map(renderDoneItem)}
            </View>
          )}

          {hasExpired && (
            <View style={styles.expiredSection}>
              <Pressable
                style={[styles.expiredButton, { backgroundColor: semantic.surfaceSecondary(isDark) }]}
                onPress={() => navigation.navigate('Expired')}
              >
                <Text style={[styles.expiredButtonText, { color: semantic.textSecondary(isDark) }]}>
                  {HOME_SECTIONS.VIEW_EXPIRED}
                </Text>
                <Text style={[styles.expiredCount, { color: semantic.textSecondary(isDark) }]}>
                  {HOME_SECTIONS.EXPIRED_COUNT(expired.length)}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: brand.primary }]}
        onPress={handleAddCommitment}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={handleCancel}
        onMarkDone={handleMarkDone}
        onDelete={handleDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  section: {
    marginBottom: 24,
  },
  openEndedSeparator: {
    borderTopWidth: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionTitleMuted: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.9,
  },
  doneItem: {
    opacity: 0.85,
  },
  expiredSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  expiredButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  expiredButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  expiredCount: {
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: misc.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: misc.white,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
});
