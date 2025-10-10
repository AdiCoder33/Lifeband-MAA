import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import {DEVICE_NAME_PREFIX as ENV_DEVICE_PREFIX} from '@env';
import {useBle} from '../../features/ble/BleProvider';
import type {BleDevice} from '../../features/ble/types';
import {ConnectionStatus} from '../../components/ConnectionStatus';
import {requestBlePermissions} from '../../hooks/useBlePermissions';
import {useAppStore} from '../../store/useAppStore';
import {useUnsyncedReadingsCount} from '../../hooks/useUnsyncedReadingsCount';
import {useSync} from '../../hooks/useSync';

const DEFAULT_PREFIX = ENV_DEVICE_PREFIX || 'LIFEBAND';

export const ScanConnectScreen: React.FC = () => {
  const {
    status,
    statusMessage,
    devices,
    connectedDevice,
    start,
    stop,
    setPatientId,
    setUploadEndpoint,
    patientId,
    uploadEndpoint,
  } = useBle();

  const [prefix, setPrefix] = useState(DEFAULT_PREFIX);
  const [patientValue, setPatientValue] = useState(patientId ?? '');
  const [endpointValue, setEndpointValue] = useState(uploadEndpoint ?? '');
  const syncStatus = useAppStore(state => state.syncStatus);
  const offline = useAppStore(state => state.offline);
  const lastSyncAt = useAppStore(state => state.lastSyncAt);
  const unsyncedCount = useUnsyncedReadingsCount();
  const setSelectedPatient = useAppStore(state => state.setSelectedPatient);
  const {syncNow, error} = useSync();

  useEffect(() => {
    setPatientValue(patientId ?? '');
  }, [patientId]);

  useEffect(() => {
    setEndpointValue(uploadEndpoint ?? '');
  }, [uploadEndpoint]);

  const isScanning = useMemo(
    () =>
      status === 'starting' || status === 'scanning' || status === 'connecting',
    [status],
  );

  const handleStart = async (device?: BleDevice) => {
    if (Platform.OS === 'android') {
      const granted = await requestBlePermissions();
      if (!granted) {
        Alert.alert(
          'Permissions needed',
          'LifeBand requires Bluetooth and Location permissions to discover the wearable.',
        );
        return;
      }
    }

    if (device) {
      await start({deviceId: device.id});
      return;
    }
    await start({
      deviceNamePrefix: prefix.trim() || DEFAULT_PREFIX,
    });
  };

  const handleSavePatient = async () => {
    await setPatientId(patientValue.trim());
  };

  const handleSaveEndpoint = async () => {
    await setUploadEndpoint(endpointValue.trim());
  };

  const renderDevice = ({item}: {item: BleDevice}) => {
    const connected = connectedDevice?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.deviceCard, connected && styles.deviceCardActive]}
        onPress={() => handleStart(item)}>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceName}>{item.name || 'Unknown device'}</Text>
          {typeof item.rssi === 'number' ? (
            <Text style={styles.deviceRssi}>{item.rssi} dBm</Text>
          ) : null}
        </View>
        <Text style={styles.deviceId}>{item.id}</Text>
        {connected ? <Text style={styles.connectedBadge}>Connected</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scan and Connect</Text>
      <Text style={styles.description}>
        Start scanning to automatically connect to the first LifeBand in range or tap a device below.
      </Text>

      <ConnectionStatus
        status={status}
        message={statusMessage}
        deviceName={connectedDevice?.name}
      />

      <View style={styles.syncCard}>
        <View style={styles.syncStatusRow}>
          <Text style={styles.syncTitle}>Sync status</Text>
          <Text
            style={[
              styles.syncStatus,
              syncStatus === 'error'
                ? styles.syncStatusError
                : syncStatus === 'syncing'
                ? styles.syncStatusSyncing
                : styles.syncStatusIdle,
            ]}>
            {syncStatus.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.syncMeta}>
          Pending uploads: {unsyncedCount}{' '}
          {offline ? '(offline)' : ''}
        </Text>
        {lastSyncAt ? (
          <Text style={styles.syncMeta}>
            Last sync: {new Date(lastSyncAt).toLocaleString()}
          </Text>
        ) : null}
        {error ? <Text style={styles.syncError}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={syncNow}
          disabled={syncStatus === 'syncing'}>
          <Text style={styles.syncButtonText}>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={styles.label}>Target name prefix</Text>
          <TextInput
            value={prefix}
            onChangeText={setPrefix}
            placeholder={DEFAULT_PREFIX}
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>
        <TouchableOpacity
          style={[styles.actionButton, isScanning && styles.buttonDisabled]}
          onPress={() => handleStart()}
          disabled={isScanning}>
          <Text style={styles.actionButtonText}>{isScanning ? 'Scanning...' : 'Start Scan'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.stopButton]} onPress={stop}>
          <Text style={styles.actionButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldRow}>
        <View style={[styles.field, styles.flexGrow]}>
          <Text style={styles.label}>Patient ID</Text>
          <TextInput
            value={patientValue}
            onChangeText={setPatientValue}
            placeholder="Patient identifier"
            style={styles.input}
            autoCapitalize="characters"
            onBlur={handleSavePatient}
          />
        </View>
        <View style={[styles.field, styles.flexGrow]}>
          <Text style={styles.label}>Upload endpoint</Text>
          <TextInput
            value={endpointValue}
            onChangeText={setEndpointValue}
            placeholder="https://api.example.com/vitals"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
            onBlur={handleSaveEndpoint}
          />
        </View>
      </View>

      <Text style={styles.listTitle}>Nearby devices</Text>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={renderDevice}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No devices discovered yet. Start a scan to look for wearables.
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202124',
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    color: '#5F6368',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 18,
  },
  field: {
    marginRight: 12,
  },
  flexGrow: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minWidth: 160,
    backgroundColor: '#FAFBFF',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1A73E8',
  },
  stopButton: {
    backgroundColor: '#D93025',
  },
  buttonDisabled: {
    backgroundColor: '#96B7F2',
  },
  actionButtonText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listTitle: {
    marginTop: 28,
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
  },
  listContent: {
    paddingBottom: 120,
  },
  syncCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F6F9FE',
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
  },
  syncStatus: {
    fontWeight: '700',
  },
  syncStatusIdle: {
    color: '#0F9D58',
  },
  syncStatusSyncing: {
    color: '#F9AB00',
  },
  syncStatusError: {
    color: '#D93025',
  },
  syncMeta: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 2,
  },
  syncError: {
    marginTop: 6,
    fontSize: 12,
    color: '#D93025',
  },
  syncButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1A73E8',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deviceCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deviceCardActive: {
    borderColor: '#1A73E8',
    backgroundColor: '#E8F0FE',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202124',
  },
  deviceRssi: {
    fontSize: 12,
    color: '#5F6368',
  },
  deviceId: {
    marginTop: 6,
    fontSize: 12,
    color: '#5F6368',
  },
  connectedBadge: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F9D58',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: '#80868B',
  },
});

export default ScanConnectScreen;
