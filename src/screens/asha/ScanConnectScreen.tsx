import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {DEVICE_NAME_PREFIX as ENV_DEVICE_PREFIX} from '@env';
import ScreenBackground from '../../components/ScreenBackground';

import {useBle} from '../../features/ble/BleProvider';
import type {BleDevice} from '../../features/ble/types';
import {ConnectionStatus} from '../../components/ConnectionStatus';
import {requestBlePermissions} from '../../hooks/useBlePermissions';
import {useAppStore} from '../../store/useAppStore';
import {useUnsyncedReadingsCount} from '../../hooks/useUnsyncedReadingsCount';
import {useSync} from '../../hooks/useSync';
import {palette, radii, spacing} from '../../theme';

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
    setSelectedPatient(patientValue.trim() || undefined);
  };

  const handleSaveEndpoint = async () => {
    await setUploadEndpoint(endpointValue.trim());
  };

  const renderDevice = ({item}: {item: BleDevice}) => {
    const connected = connectedDevice?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.deviceCard, connected && styles.deviceCardActive]}
        onPress={() => handleStart(item)}
        accessibilityRole="button">
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
    <ScreenBackground>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">


        <View style={styles.statusCard}>
          <ConnectionStatus
            status={status}
            message={statusMessage}
            deviceName={connectedDevice?.name}
          />
          <View style={styles.syncRow}>
            <View>
              <Text style={styles.syncLabel}>Sync status</Text>
              <Text style={styles.syncValue}>{syncStatus.toUpperCase()}</Text>
              <Text style={styles.syncMeta}>
                {lastSyncAt
                  ? `Last sync ${new Date(lastSyncAt).toLocaleString()}`
                  : 'No sync yet'}
              </Text>
            </View>
            <View>
              <Text style={styles.syncLabel}>Unsynced readings</Text>
              <Text style={styles.syncValue}>{unsyncedCount}</Text>
              {offline ? (
                <Text style={styles.syncMeta}>Offline mode - sync paused</Text>
              ) : null}
            </View>
          </View>
          {error ? <Text style={styles.syncError}>{error}</Text> : null}
          <TouchableOpacity
            onPress={syncNow}
            style={styles.syncAction}
            accessibilityRole="button">
            <Text style={styles.syncActionLabel}>Sync now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>📱 Device Configuration</Text>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>Device name prefix</Text>
              <TextInput
                value={prefix}
                onChangeText={setPrefix}
                placeholder={DEFAULT_PREFIX}
                placeholderTextColor="#6B7A90"
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>
            <TouchableOpacity
              onPress={() => setPrefix(DEFAULT_PREFIX)}
              style={styles.outlineButton}>
              <Text style={styles.outlineButtonLabel}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
            🤰 Maternal Care ID
          </Text>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>Expecting Mother ID</Text>
              <TextInput
                value={patientValue}
                onChangeText={setPatientValue}
                placeholder="e.g. MAT-103"
                placeholderTextColor="#6B7A90"
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>
            <TouchableOpacity
              onPress={handleSavePatient}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>Save ID</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>Upload endpoint</Text>
              <TextInput
                value={endpointValue}
                onChangeText={setEndpointValue}
                placeholder="https://api.lifeband.care/sync"
                placeholderTextColor="#6B7A90"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <TouchableOpacity
              onPress={handleSaveEndpoint}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>Save URL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.devicesCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💓 LifeBand Devices</Text>
            <Text style={styles.sectionMeta}>
              Tap a device to connect and start monitoring maternal health.
            </Text>
          </View>
          <FlatList
            data={devices}
            keyExtractor={item => item.id}
            renderItem={renderDevice}
            scrollEnabled={false}
            style={styles.deviceList}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {isScanning
                  ? '🔍 Scanning... bring the LifeBand closer.'
                  : '📱 No devices discovered yet. Start scanning to refresh.'}
              </Text>
            }
          />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scanButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  statusCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: '#0F2B50',
    borderWidth: 1,
    borderColor: '#1F3F70',
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  syncLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CB3DC',
    textTransform: 'uppercase',
  },
  syncValue: {
    marginTop: spacing.xs,
    color: palette.textOnDark,
    fontWeight: '700',
    fontSize: 18,
  },
  syncMeta: {
    marginTop: 2,
    color: '#9CB3DC',
    fontSize: 12,
  },
  syncError: {
    marginTop: spacing.sm,
    color: '#FBC8C2',
    fontSize: 12,
  },
  syncAction: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
  },
  syncActionLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  formCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  sectionMeta: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: palette.textSecondary,
  },
  sectionSpacing: {
    marginTop: spacing.lg,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  field: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: palette.textPrimary,
    backgroundColor: palette.surfaceSoft,
  },
  outlineButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  outlineButtonLabel: {
    color: palette.primary,
    fontWeight: '700',
  },
  primaryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
  },
  primaryButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  devicesCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
    flex: 1,
  },
  deviceCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
  },
  deviceCardActive: {
    borderColor: palette.primary,
    backgroundColor: '#E8F0FE',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  deviceRssi: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  deviceId: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: palette.textSecondary,
  },
  connectedBadge: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
    color: palette.success,
  },
  deviceList: {
    maxHeight: 300,
    marginTop: spacing.sm,
  },
  empty: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: palette.textSecondary,
    fontSize: 14,
  },
});

export default ScanConnectScreen;
