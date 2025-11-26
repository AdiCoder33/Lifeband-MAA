import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {palette, radii, spacing} from '../theme';
import {PregnancyProfile} from '../types/models';

type Props = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<PregnancyProfile, 'recordedAt'>) => void;
};

const PregnancyIntakeModal: React.FC<Props> = ({
  visible,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [monthsPregnant, setMonthsPregnant] = useState('');
  const [extraDays, setExtraDays] = useState('');
  const [preferredCheckupTime, setPreferredCheckupTime] = useState('');
  const [currentWeightKg, setCurrentWeightKg] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const months = Number(monthsPregnant);
    const days = extraDays ? Number(extraDays) : 0;
    return (
      Number.isFinite(months) &&
      months >= 0 &&
      (!extraDays || (Number.isFinite(days) && days >= 0 && days <= 6))
    );
  }, [extraDays, monthsPregnant]);

  const handleSubmit = () => {
    setError(null);
    const months = Number(monthsPregnant);
    const days = extraDays ? Number(extraDays) : 0;
    const weight = currentWeightKg ? Number(currentWeightKg) : undefined;

    if (!Number.isFinite(months) || months < 0) {
      setError('Please enter how many months pregnant you are.');
      return;
    }

    if (extraDays && (!Number.isFinite(days) || days < 0 || days > 6)) {
      setError('Days should be between 0 and 6.');
      return;
    }

    if (currentWeightKg && (!Number.isFinite(weight) || weight <= 0)) {
      setError('Enter a valid weight in kg.');
      return;
    }

    onSubmit({
      monthsPregnant: months,
      extraDays: days || undefined,
      preferredCheckupTime: preferredCheckupTime.trim() || undefined,
      currentWeightKg: weight,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Your pregnancy journey</Text>
          <Text style={styles.subtitle}>
            Share a few details so we can personalise milestones and reminders.
          </Text>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Months pregnant</Text>
              <TextInput
                keyboardType="numeric"
                value={monthsPregnant}
                onChangeText={setMonthsPregnant}
                placeholder="e.g. 6"
                style={styles.input}
                placeholderTextColor={palette.textSecondary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Extra days</Text>
              <TextInput
                keyboardType="numeric"
                value={extraDays}
                onChangeText={setExtraDays}
                placeholder="0-6"
                style={styles.input}
                placeholderTextColor={palette.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred checkup time</Text>
            <TextInput
              value={preferredCheckupTime}
              onChangeText={setPreferredCheckupTime}
              placeholder="e.g. 10:30 AM"
              style={styles.input}
              placeholderTextColor={palette.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current weight (kg)</Text>
            <TextInput
              keyboardType="numeric"
              value={currentWeightKg}
              onChangeText={setCurrentWeightKg}
              placeholder="e.g. 62.5"
              style={styles.input}
              placeholderTextColor={palette.textSecondary}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.secondaryButton]}
              disabled={loading}>
              <Text style={[styles.buttonLabel, styles.secondaryLabel]}>Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.button,
                styles.primaryButton,
                !canSubmit && styles.buttonDisabled,
              ]}
              disabled={!canSubmit || loading}>
              {loading ? (
                <ActivityIndicator color={palette.textOnPrimary} />
              ) : (
                <Text style={styles.buttonLabel}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  subtitle: {
    color: palette.textSecondary,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: palette.textPrimary,
    backgroundColor: palette.surfaceSoft,
  },
  error: {
    color: palette.danger,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minWidth: 96,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  secondaryButton: {
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: palette.textPrimary,
  },
});

export default PregnancyIntakeModal;
