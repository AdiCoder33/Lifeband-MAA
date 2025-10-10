import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type ReadingTileProps = {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
};

export const ReadingTile: React.FC<ReadingTileProps> = ({label, value, unit}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {value ?? '--'}
        </Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 120,
    padding: 16,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#202124',
  },
  unit: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#5F6368',
  },
});

export default ReadingTile;
