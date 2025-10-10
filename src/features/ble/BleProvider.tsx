import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useEffect,
} from 'react';
import {
  LifeBandBleModule,
  subscribeToDevice,
  subscribeToError,
  subscribeToReading,
  subscribeToStatus,
} from './nativeModule';
import type {
  BleConnectionStatus,
  BleDevice,
  BleDevicePayload,
  BleReading,
  BleStatusPayload,
  StartBleOptions,
} from './types';
import {readingStore} from '../../store/useReadingStore';

type BleState = {
  status: BleConnectionStatus;
  statusMessage?: string;
  devices: Record<string, BleDevice>;
  connectedDevice?: BleDevice;
  readings: BleReading[];
  lastReading?: BleReading;
  patientId?: string;
  uploadEndpoint?: string;
};

type BleAction =
  | {type: 'STATUS'; payload: BleStatusPayload}
  | {type: 'DEVICE'; payload: BleDevicePayload}
  | {type: 'READING'; payload: BleReading}
  | {type: 'SET_PATIENT'; payload?: string}
  | {type: 'SET_ENDPOINT'; payload?: string}
  | {type: 'CLEAR_READINGS'}
  | {type: 'RESET'};

const initialState: BleState = {
  status: 'idle',
  devices: {},
  readings: [],
};

const reducer = (state: BleState, action: BleAction): BleState => {
  switch (action.type) {
    case 'STATUS': {
      return {
        ...state,
        status: action.payload.status,
        statusMessage: action.payload.message,
      };
    }
    case 'DEVICE': {
      const nextDevices = {...state.devices};
      const {device, event} = action.payload;

      if (event === 'DISCOVERED') {
        nextDevices[device.id] = device;
        return {...state, devices: nextDevices};
      }

      if (event === 'CONNECTED') {
        nextDevices[device.id] = device;
        return {...state, devices: nextDevices, connectedDevice: device};
      }

      if (event === 'DISCONNECTED') {
        const {[device.id]: _removed, ...remaining} = nextDevices;
        return {
          ...state,
          devices: remaining,
          connectedDevice:
            state.connectedDevice?.id === device.id
              ? undefined
              : state.connectedDevice,
        };
      }

      return state;
    }
    case 'READING': {
      const readings = [action.payload, ...state.readings].slice(0, 20);
      return {
        ...state,
        lastReading: action.payload,
        readings,
      };
    }
    case 'SET_PATIENT':
      return {...state, patientId: action.payload};
    case 'SET_ENDPOINT':
      return {...state, uploadEndpoint: action.payload};
    case 'CLEAR_READINGS':
      return {...state, readings: [], lastReading: undefined};
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

type BleContextValue = {
  status: BleConnectionStatus;
  statusMessage?: string;
  devices: BleDevice[];
  connectedDevice?: BleDevice;
  lastReading?: BleReading;
  readings: BleReading[];
  patientId?: string;
  uploadEndpoint?: string;
  start: (options?: StartBleOptions) => Promise<void>;
  stop: () => Promise<void>;
  setPatientId: (patientId: string) => Promise<void>;
  setUploadEndpoint: (endpoint: string) => Promise<void>;
  clearReadings: () => void;
  reset: () => void;
};

const BleContext = createContext<BleContextValue | undefined>(undefined);

const mapReadings = (reading: BleReading): BleReading => ({
  ...reading,
  timestamp: new Date(reading.timestamp).toISOString(),
});

export const BleProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const currentStatusRef = useRef<BleConnectionStatus>('idle');
  const patientIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    patientIdRef.current = state.patientId;
  }, [state.patientId]);

  const persistReading = useCallback(
    (incoming: BleReading) => {
      const patientId = patientIdRef.current;
      if (!patientId) {
        return;
      }
      const {addReading} = readingStore.getState();
      addReading({
        patientId,
        heartRate: Math.round(incoming.heartRate),
        spo2: Math.round(incoming.spo2),
        hrv: Math.round(incoming.hrv),
        systolic: Math.round(incoming.systolic),
        diastolic: Math.round(incoming.diastolic),
        temperature: incoming.temperature,
        timestamp: incoming.timestamp,
        uploaded: false,
      });
    },
    [],
  );

  useEffect(() => {
    const statusSub = subscribeToStatus((payload: BleStatusPayload) => {
      currentStatusRef.current = payload.status;
      dispatch({type: 'STATUS', payload});
    });

    const deviceSub = subscribeToDevice((payload: BleDevicePayload) => {
      dispatch({type: 'DEVICE', payload});
    });

    const readingSub = subscribeToReading(({reading}) => {
      const mapped = mapReadings(reading);
      dispatch({type: 'READING', payload: mapped});
      persistReading(mapped);
    });

    const errorSub = subscribeToError(message => {
      dispatch({
        type: 'STATUS',
        payload: {status: 'error', message},
      });
    });

    return () => {
      statusSub.remove();
      deviceSub.remove();
      readingSub.remove();
      errorSub.remove();
    };
  }, [persistReading]);

  const start = useCallback(
    async (options?: StartBleOptions) => {
      dispatch({
        type: 'STATUS',
        payload: {
          status: 'starting',
          message: 'Preparing LifeBand BLE service',
        },
      });

      await Promise.resolve(LifeBandBleModule.startBle(options));
    },
    [],
  );

  const stop = useCallback(async () => {
    await Promise.resolve(LifeBandBleModule.stopBle());
    dispatch({type: 'STATUS', payload: {status: 'idle'}});
  }, []);

  const setPatientId = useCallback(async (patientId: string) => {
    dispatch({type: 'SET_PATIENT', payload: patientId});
    patientIdRef.current = patientId;
    await Promise.resolve(LifeBandBleModule.setPatientId(patientId));
  }, []);

  const setUploadEndpoint = useCallback(async (endpoint: string) => {
    dispatch({type: 'SET_ENDPOINT', payload: endpoint});
    await Promise.resolve(LifeBandBleModule.setUploadEndpoint(endpoint));
  }, []);

  const value = useMemo<BleContextValue>(
    () => ({
      status: state.status,
      statusMessage: state.statusMessage,
      devices: Object.values(state.devices),
      connectedDevice: state.connectedDevice,
      lastReading: state.lastReading,
      readings: state.readings,
      patientId: state.patientId,
      uploadEndpoint: state.uploadEndpoint,
      start,
      stop,
      setPatientId,
      setUploadEndpoint,
      clearReadings: () => dispatch({type: 'CLEAR_READINGS'}),
      reset: () => dispatch({type: 'RESET'}),
    }),
    [
      setPatientId,
      setUploadEndpoint,
      start,
      state.connectedDevice,
      state.devices,
      state.lastReading,
      state.patientId,
      state.readings,
      state.status,
      state.statusMessage,
      state.uploadEndpoint,
      stop,
    ],
  );

  return <BleContext.Provider value={value}>{children}</BleContext.Provider>;
};

export const useBle = (): BleContextValue => {
  const ctx = useContext(BleContext);
  if (!ctx) {
    throw new Error('useBle must be used within a BleProvider');
  }
  return ctx;
};
