import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {palette, radii, spacing} from '../theme';

type ReadingTileProps = {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  trend?: 'up' | 'down' | 'steady';
  variant?: 'primary' | 'secondary';
};

const formatValue = (value: ReadingTileProps['value']) => {
  if (value === null || value === undefined || value === '') {
    return '--';
  }
  return typeof value === 'number' ? value.toString() : value;
};

export const ReadingTile: React.FC<ReadingTileProps> = ({
  label,
  value,
  unit,
  trend = 'steady',
  variant = 'primary',
}) => {
  return (
    <View
      style={[
        styles.container,
        variant === 'secondary' && styles.containerSecondary,
      ]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{formatValue(value)}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <View style={styles.footer}>
        <View style={[styles.trendPill, trendStyleMap[trend]]}>
          <Text style={styles.trendText}>
            {trend === 'up'
              ? 'Rising'
              : trend === 'down'
              ? 'Dropping'
              : 'Stable'}
          </Text>
        </View>
        <Text style={styles.footerHint}>Last 24h</Text>
      </View>
    </View>
  );
};

const trendStyleMap: Record<
  NonNullable<ReadingTileProps['trend']>,
  {backgroundColor: string}
> = {
  up: {
    backgroundColor: palette.danger,
  },
  down: {
    backgroundColor: palette.success,
  },
  steady: {
    backgroundColor: palette.accent,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
    padding: spacing.lg,
    margin: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  containerSecondary: {
    backgroundColor: palette.maternal.cream,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  unit: {
    marginLeft: spacing.xs,
    fontSize: 16,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  trendText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  footerHint: {
    fontSize: 11,
    color: palette.textSecondary,
  },
});

export default ReadingTile;
