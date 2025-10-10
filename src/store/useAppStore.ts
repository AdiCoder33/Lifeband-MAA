import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RiskFeedItem} from '../types/models';

export type SyncStatus = 'idle' | 'syncing' | 'error';

interface AppState {
  selectedPatientId?: string;
  setSelectedPatient: (id?: string) => void;

  offline: boolean;
  setOffline: (value: boolean) => void;

  lastSyncAt?: string;
  setLastSyncAt: (timestamp: string | undefined) => void;
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;

  riskFeed: RiskFeedItem[];
  addRiskItem: (item: RiskFeedItem) => void;
  clearRiskFeed: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedPatientId: undefined,
      setSelectedPatient: id => set({selectedPatientId: id}),
      offline: false,
      setOffline: value => set({offline: value}),
      lastSyncAt: undefined,
      setLastSyncAt: timestamp => set({lastSyncAt: timestamp}),
      syncStatus: 'idle',
      setSyncStatus: status => set({syncStatus: status}),
      riskFeed: [],
      addRiskItem: item =>
        set({
          riskFeed: [item, ...get().riskFeed]
            .sort((a, b) => riskScore(b.risk) - riskScore(a.risk))
            .slice(0, 50),
        }),
      clearRiskFeed: () => set({riskFeed: []}),
    }),
    {
      name: 'lifeband-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        selectedPatientId: state.selectedPatientId,
        lastSyncAt: state.lastSyncAt,
      }),
    },
  ),
);

const riskScore = (risk: RiskFeedItem['risk']) => {
  switch (risk) {
    case 'HIGH':
      return 3;
    case 'MODERATE':
      return 2;
    case 'LOW':
      return 1;
    default:
      return 0;
  }
};
