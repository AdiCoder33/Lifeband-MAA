import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {BleConnectionStatus} from '../features/ble/types';

type ConnectionStatusProps = {
  status: BleConnectionStatus;
  message?: string;
  deviceName?: string;
};

const statusColors: Record<BleConnectionStatus, string> = {
  idle: '#5F6368',
  starting: '#1A73E8',
  scanning: '#1A73E8',
  connecting: '#1A73E8',
  connected: '#0F9D58',
  disconnecting: '#D93025',
  disconnected: '#F9AB00',
  error: '#D93025',
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  message,
  deviceName,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.status, {color: statusColors[status]}]}>
        {status.toUpperCase()}
      </Text>
      {deviceName ? <Text style={styles.device}>{deviceName}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F1F3F4',
    marginVertical: 12,
  },
  status: {
    fontSize: 16,
    fontWeight: '700',
  },
  device: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
  },
  message: {
    marginTop: 4,
    fontSize: 13,
    color: '#5F6368',
  },
});

export default ConnectionStatus;
