import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import type {NativeModule} from 'react-native';
import type {
  BleDevicePayload,
  BleReadingPayload,
  BleStatusPayload,
  StartBleOptions,
} from './types';

const LINKING_ERROR =
  `The package 'LifeBandBleModule' doesn't seem to be linked. Make sure:\n` +
  Platform.select({
    ios: "- you have run 'pod install'\n",
    default: '',
  }) +
  '- the app has been rebuilt after installing the package\n' +
  '- you are not using Expo managed workflow\n';

type LifeBandBleNativeModule = NativeModule & {
  startBle(options?: StartBleOptions): Promise<void> | void;
  stopBle(): Promise<void> | void;
  setPatientId(patientId: string): Promise<void> | void;
  setUploadEndpoint(endpoint: string): Promise<void> | void;
};

const nativeModule = NativeModules.LifeBandBleModule as
  | LifeBandBleNativeModule
  | undefined;

const createStub = (): LifeBandBleNativeModule => ({
  startBle: async () => {
    console.warn(LINKING_ERROR);
  },
  stopBle: async () => {
    console.warn(LINKING_ERROR);
  },
  setPatientId: async () => {
    console.warn(LINKING_ERROR);
  },
  setUploadEndpoint: async () => {
    console.warn(LINKING_ERROR);
  },
  addListener: () => {},
  removeListeners: () => {},
});

export const LifeBandBleModule: LifeBandBleNativeModule = nativeModule ?? createStub();

const emitter = new NativeEventEmitter(nativeModule);

export const BleEvents = {
  Status: 'LifeBandBleStatus' as const,
  Reading: 'LifeBandBleReading' as const,
  Device: 'LifeBandBleDevice' as const,
  Error: 'LifeBandBleError' as const,
};

export const subscribeToStatus = (
  listener: (payload: BleStatusPayload) => void,
) => emitter.addListener(BleEvents.Status, listener);

export const subscribeToReading = (
  listener: (payload: BleReadingPayload) => void,
) => emitter.addListener(BleEvents.Reading, listener);

export const subscribeToDevice = (
  listener: (payload: BleDevicePayload) => void,
) => emitter.addListener(BleEvents.Device, listener);

export const subscribeToError = (listener: (message: string) => void) =>
  emitter.addListener(BleEvents.Error, listener);
