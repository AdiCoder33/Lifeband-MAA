import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {BleReading} from '../features/ble/types';
import {PatientDetail, PatientSummary} from '../types/models';

export type StoredReading = BleReading & {
  id: string;
  patientId: string;
  uploaded: boolean;
  syncedAt?: string;
};

type PatientsMap = Record<string, PatientDetail>;

type ReadingState = {
  readings: StoredReading[];
  patients: PatientsMap;
  addReading: (reading: Omit<StoredReading, 'id'> & {id?: string}) => void;
  markUploaded: (ids: string[], syncedAt: string) => void;
  getReadings: (patientId: string, days?: number) => StoredReading[];
  getUnsynced: () => StoredReading[];
  upsertPatients: (items: PatientSummary[]) => void;
  upsertPatientDetail: (detail: PatientDetail) => void;
  clearAll: () => void;
};

const STORAGE_KEY = 'lifeband-readings';

const clampDays = (days?: number) => {
  if (!days || Number.isNaN(days)) {
    return undefined;
  }
  return Math.max(days, 0);
};

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      readings: [],
      patients: {},
      addReading: reading => {
        const id =
          reading.id ??
          `${reading.patientId}-${new Date(reading.timestamp).getTime()}-${Math.random()
            .toString(16)
            .slice(2)}`;

        set(state => {
          if (state.readings.some(item => item.id === id)) {
            return state;
          }
          const entry: StoredReading = {
            ...reading,
            id,
          };
          return {
            ...state,
            readings: [entry, ...state.readings],
          };
        });
      },
      markUploaded: (ids, syncedAt) => {
        if (!ids.length) {
          return;
        }
        set(state => ({
          ...state,
          readings: state.readings.map(reading =>
            ids.includes(reading.id)
              ? {...reading, uploaded: true, syncedAt}
              : reading,
          ),
        }));
      },
      getReadings: (patientId, days) => {
        if (!patientId) {
          return [];
        }
        const {readings} = get();
        const normalized = clampDays(days);
        const cutoff =
          normalized != null
            ? Date.now() - normalized * 24 * 60 * 60 * 1000
            : undefined;

        return readings
          .filter(reading => {
            if (reading.patientId !== patientId) {
              return false;
            }
            if (!cutoff) {
              return true;
            }
            const timestamp = new Date(reading.timestamp).getTime();
            return Number.isNaN(timestamp) ? false : timestamp >= cutoff;
          })
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime(),
          );
      },
      getUnsynced: () => {
        const {readings} = get();
        return readings.filter(reading => !reading.uploaded);
      },
      upsertPatients: items => {
        if (!items?.length) {
          return;
        }
        set(state => {
          const next = {...state.patients};
          items.forEach(item => {
            const existing = next[item.id];
            next[item.id] = {
              ...existing,
              ...item,
            };
          });
          return {...state, patients: next};
        });
      },
      upsertPatientDetail: detail => {
        if (!detail?.id) {
          return;
        }
        set(state => ({
          ...state,
          patients: {
            ...state.patients,
            [detail.id]: {
              ...state.patients[detail.id],
              ...detail,
            },
          },
        }));
      },
      clearAll: () => set({readings: [], patients: {}}),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        readings: state.readings,
        patients: state.patients,
      }),
    },
  ),
);

export const readingStore = {
  getState: useReadingStore.getState,
};
