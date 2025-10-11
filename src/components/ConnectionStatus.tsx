import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {BleConnectionStatus} from '../features/ble/types';
import {palette, radii, spacing} from '../theme';

type ConnectionStatusProps = {
  status: BleConnectionStatus;
  message?: string;
  deviceName?: string;
};

const statusColors: Record<BleConnectionStatus, string> = {
  idle: palette.textSecondary,
  starting: palette.primary,
  scanning: palette.primary,
  connecting: palette.primary,
  connected: palette.success,
  disconnecting: palette.danger,
  disconnected: palette.accent,
  error: palette.danger,
};

const statusCopy: Record<BleConnectionStatus, string> = {
  idle: 'Ready to connect',
  starting: 'Preparing Bluetooth',
  scanning: 'Scanning for LifeBand',
  connecting: 'Connecting to device',
  connected: 'Device connected',
  disconnecting: 'Disconnecting',
  disconnected: 'Device disconnected',
  error: 'Connection error',
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  message,
  deviceName,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.pill, {backgroundColor: `${statusColors[status]}22`}]}>
        <View style={[styles.pillDot, {backgroundColor: statusColors[status]}]} />
        <Text style={[styles.pillText, {color: statusColors[status]}]}>
          {statusCopy[status]}
        </Text>
      </View>
      {deviceName ? (
        <Text style={styles.device}>Linked device: {deviceName}</Text>
      ) : (
        <Text style={styles.device}>No device linked</Text>
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: '#102C56',
    borderWidth: 1,
    borderColor: '#1D3F70',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  device: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: palette.textOnDark,
    fontWeight: '600',
  },
  message: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: palette.primaryLight,
    opacity: 0.9,
  },
});

export default ConnectionStatus;
