import {useCallback, useState} from 'react';
import {syncUnsyncedReadings} from '../services/sync/syncManager';
import {useAppStore} from '../store/useAppStore';

export const useSync = () => {
  const setSyncStatus = useAppStore(state => state.setSyncStatus);
  const setLastSyncAt = useAppStore(state => state.setLastSyncAt);
  const [error, setError] = useState<string | null>(null);

  const syncNow = useCallback(async () => {
    setError(null);
    setSyncStatus('syncing');
    try {
      const success = await syncUnsyncedReadings();
      setSyncStatus(success ? 'idle' : 'error');
      if (success) {
        setLastSyncAt(new Date().toISOString());
      } else {
        setError('Upload failed. Will retry automatically.');
      }
    } catch (err) {
      setSyncStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [setLastSyncAt, setSyncStatus]);

  return {syncNow, error};
};
