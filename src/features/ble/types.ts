export type BleConnectionStatus =
  | 'idle'
  | 'starting'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'error';

export interface BleReading {
  heartRate: number;
  spo2: number;
  hrv: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  timestamp: string;
}

export interface BleDevice {
  id: string;
  name: string;
  rssi?: number;
}

export interface StartBleOptions {
  /**
   * Direct device identifier. Takes priority over `deviceNamePrefix`.
   */
  deviceId?: string;
  /**
   * Prefix used to match advertising names while scanning.
   */
  deviceNamePrefix?: string;
  /**
   * Advertising MAC address to target if already known.
   */
  macAddress?: string;
}

export interface BleStatusPayload {
  status: BleConnectionStatus;
  message?: string;
}

export interface BleReadingPayload {
  reading: BleReading;
}

export type BleDeviceEventType = 'DISCOVERED' | 'CONNECTED' | 'DISCONNECTED';

export interface BleDevicePayload {
  device: BleDevice;
  event: BleDeviceEventType;
}
