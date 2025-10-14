import React, {useCallback, useEffect} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from '../context/AuthContext';
import {BleProvider} from '../features/ble/BleProvider';
import {useNetworkMonitor} from '../hooks/useNetworkMonitor';
import {syncUnsyncedReadings} from '../services/sync/syncManager';
import {useAppStore} from '../store/useAppStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type AppProvidersProps = React.PropsWithChildren;

const Bootstrap: React.FC<React.PropsWithChildren> = ({children}) => {
  const setSyncStatus = useAppStore(state => state.setSyncStatus);
  const setLastSyncAt = useAppStore(state => state.setLastSyncAt);
  const offline = useAppStore(state => state.offline);

  useNetworkMonitor();

  const runSync = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const success = await syncUnsyncedReadings();
      setSyncStatus(success ? 'idle' : 'error');
      if (success) {
        setLastSyncAt(new Date().toISOString());
      }
    } catch (error) {
      console.warn('[Sync]', error);
      setSyncStatus('error');
    }
  }, [setLastSyncAt, setSyncStatus]);

  useEffect(() => {
    runSync();
  }, [runSync]);

  useEffect(() => {
    if (!offline) {
      runSync();
    }
  }, [offline, runSync]);

  return <>{children}</>;
};

export const AppProviders: React.FC<AppProvidersProps> = ({children}) => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Bootstrap>
            <BleProvider>{children}</BleProvider>
          </Bootstrap>
        </QueryClientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default AppProviders;
