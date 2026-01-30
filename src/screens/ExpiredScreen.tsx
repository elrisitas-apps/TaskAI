import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { CommitmentStatusEnum } from '../constants/Enums';
import { formatDate } from '../utils/date';
import { semantic } from '../constants/Colors';
import Screen from '../components/Screen';
import ListItem from '../components/ListItem';
import { SCREEN_TITLES, FORM_STRINGS, STATUS_LABELS } from '../constants/Strings';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function ExpiredScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isDark = useColorScheme() === 'dark';
  const { commitments } = useSelector((state: RootState) => state.commitments);
  const expired = commitments.filter((c) => c.status === CommitmentStatusEnum.EXPIRED);

  const renderItem = ({ item }: { item: (typeof expired)[0] }) => (
    <ListItem
      title={item.title}
      subtitle={item.targetAt ? `${FORM_STRINGS.TARGET_DATE_LABEL}${formatDate(item.targetAt)}` : undefined}
      badge={{ label: STATUS_LABELS.EXPIRED, variant: CommitmentStatusEnum.EXPIRED }}
      onPress={() => navigation.navigate('CommitmentDetail', { commitmentId: item.id })}
    />
  );

  return (
    <Screen>
      <View style={styles.container}>
        {expired.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: semantic.textSecondary(isDark) }]}>
              No expired items
            </Text>
          </View>
        ) : (
          <FlatList
            data={expired}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
  },
});
