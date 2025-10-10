import {uploadReadings} from '../api/patientApi';
import {readingStore} from '../../store/useReadingStore';

const SYNC_BATCH_SIZE = 25;

export const syncUnsyncedReadings = async (): Promise<boolean> => {
  try {
    const state = readingStore.getState();
    let unsynced = state.getUnsynced();

    while (unsynced.length) {
      const batch = unsynced.slice(0, SYNC_BATCH_SIZE);
      const payload = batch.map(reading => ({
        ...reading,
        timestamp: reading.timestamp,
      }));
      await uploadReadings(payload);
      state.markUploaded(
        batch.map(item => item.id),
        new Date().toISOString(),
      );
      unsynced = state.getUnsynced();
    }

    return true;
  } catch (error) {
    console.warn('[Sync]', error);
    return false;
  }
};

export const registerBackgroundSync = async () => {
  // Background fetch integration deferred; manual sync via UI.
};
