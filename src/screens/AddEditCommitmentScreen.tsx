import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Modal, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchCommitmentById } from '../store/slices/commitmentsSlice';
import { CommitmentTypeEnum, CommitmentSourceEnum } from '../constants/Enums';
import { commitmentFormSchema, CommitmentFormData } from '../utils/validation';
import { CommitmentType, CommitmentSource } from '../domain/types';
import { format } from 'date-fns';
import { semantic } from '../constants/Colors';
import { COMMITMENT_TEMPLATES, FORM_STRINGS, BUTTON_STRINGS, COMMITMENT_TYPES, COMMON_STRINGS, ERROR_STRINGS } from '../constants/Strings';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type RouteProp = {
  key: string;
  name: 'AddEditCommitment';
  params?: {
    commitmentId?: string;
    initialCommitment?: {
      type: CommitmentType;
      title: string;
      description?: string | null;
      targetAt: string | null;
    };
  };
};

const templates = [
  { id: 'passport', name: COMMITMENT_TEMPLATES.PASSPORT, type: CommitmentTypeEnum.EXPIRATION },
  { id: 'insurance', name: COMMITMENT_TEMPLATES.INSURANCE, type: CommitmentTypeEnum.EXPIRATION },
  { id: 'warranty', name: COMMITMENT_TEMPLATES.WARRANTY, type: CommitmentTypeEnum.EXPIRATION },
  { id: 'custom', name: COMMITMENT_TEMPLATES.CUSTOM, type: CommitmentTypeEnum.DEADLINE },
];

export default function AddEditCommitmentScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const isDark = useColorScheme() === 'dark';
  const { commitments } = useSelector((state: RootState) => state.commitments);
  
  const commitmentId = route.params?.commitmentId;
  const initialFromAi = route.params?.initialCommitment;
  const existingCommitment = commitmentId
    ? commitments.find((c) => c.id === commitmentId)
    : null;
  const initial = existingCommitment ?? initialFromAi;

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [type, setType] = useState<CommitmentType>(initial?.type ?? CommitmentTypeEnum.DEADLINE);
  const [title, setTitle] = useState(initial?.title || COMMON_STRINGS.Empty);
  const [description, setDescription] = useState(initial?.description ?? COMMON_STRINGS.Empty);
  const [targetDate, setTargetDate] = useState<Date | null>(
    initial?.targetAt ? new Date(initial.targetAt) : null
  );
  const [dateInput, setDateInput] = useState(
    initial?.targetAt ? format(new Date(initial.targetAt), 'yyyy-MM-dd') : COMMON_STRINGS.Empty
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (commitmentId && !existingCommitment) {
      dispatch(fetchCommitmentById(commitmentId));
    }
  }, [commitmentId, existingCommitment, dispatch]);

  useEffect(() => {
    if (existingCommitment && commitmentId) {
      setDescription(existingCommitment.description ?? COMMON_STRINGS.Empty);
    }
  }, [existingCommitment?.description, commitmentId]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setType(template.type);
      if (template.id !== 'custom') {
        setTitle(template.name);
      }
    }
  };

  const handleDateInputChange = (text: string) => {
    setDateInput(text);
    // Try to parse the date
    const dateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const parsedDate = new Date(text);
      if (!isNaN(parsedDate.getTime())) {
        setTargetDate(parsedDate);
        setErrors((prev) => ({ ...prev, targetAt: COMMON_STRINGS.Empty }));
      }
    } else if (text === COMMON_STRINGS.Empty) {
      setTargetDate(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (type !== CommitmentTypeEnum.OPEN && !targetDate) {
      newErrors.targetAt = ERROR_STRINGS.TARGET_DATE_REQUIRED;
    }
    
    if (type !== CommitmentTypeEnum.OPEN && targetDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(targetDate);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.targetAt = ERROR_STRINGS.TARGET_DATE_FUTURE;
      }
    }
    
    try {
      const formData: CommitmentFormData = {
        type,
        title,
        description: description.trim() || null,
        targetAt: targetDate ? targetDate.toISOString() : null,
        source: selectedTemplate ? CommitmentSourceEnum.TEMPLATE : CommitmentSourceEnum.MANUAL,
      };
      commitmentFormSchema.parse(formData);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleNext = () => {
    if (!validate()) return;

    const formData = {
      type,
      title,
      description: description.trim() || null,
      targetAt: type === CommitmentTypeEnum.OPEN ? null : (targetDate ? targetDate.toISOString() : null),
      source: selectedTemplate ? CommitmentSourceEnum.TEMPLATE : CommitmentSourceEnum.MANUAL,
    };

    navigation.navigate('ConfirmCommitment', { 
      commitment: formData,
      commitmentId: commitmentId,
    });
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.text(isDark) }]}>
            {FORM_STRINGS.CHOOSE_TEMPLATE}
          </Text>
          <View style={styles.templateGrid}>
            {templates.map((template) => (
              <Button
                key={template.id}
                title={template.name}
                onPress={() => handleTemplateSelect(template.id)}
                variant={selectedTemplate === template.id ? 'primary' : 'secondary'}
                style={styles.templateButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.text(isDark) }]}>
            {FORM_STRINGS.TYPE}
          </Text>
          <View style={styles.typeButtons}>
            {[CommitmentTypeEnum.EXPIRATION, CommitmentTypeEnum.DEADLINE, CommitmentTypeEnum.OPEN].map((t) => (
              <Button
                key={t}
                title={t === CommitmentTypeEnum.EXPIRATION ? COMMITMENT_TYPES.EXPIRATION : t === CommitmentTypeEnum.DEADLINE ? COMMITMENT_TYPES.DEADLINE : COMMITMENT_TYPES.OPEN}
                onPress={() => setType(t)}
                variant={type === t ? 'primary' : 'secondary'}
                style={styles.typeButton}
              />
            ))}
          </View>
        </View>

        <Input
          label={FORM_STRINGS.TITLE}
          value={title}
          onChangeText={setTitle}
          placeholder={FORM_STRINGS.ENTER_COMMITMENT_TITLE}
          error={errors.title}
        />

        <Input
          label={FORM_STRINGS.DESCRIPTION}
          value={description}
          onChangeText={setDescription}
          placeholder={FORM_STRINGS.ENTER_DESCRIPTION}
        />

        {type !== CommitmentTypeEnum.OPEN && (
          <Input
            label={FORM_STRINGS.DATE_FORMAT_LABEL}
            value={dateInput}
            onChangeText={handleDateInputChange}
            placeholder={FORM_STRINGS.DATE_FORMAT_PLACEHOLDER}
            keyboardType="numeric"
            error={errors.targetAt}
          />
        )}

        <Button title={BUTTON_STRINGS.NEXT} onPress={handleNext} style={styles.nextButton} />
      </ScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateButton: {
    flex: 1,
    minWidth: '45%',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  dateButton: {
    marginTop: 8,
  },
  nextButton: {
    marginTop: 24,
  },
});
