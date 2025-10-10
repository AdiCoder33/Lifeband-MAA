import {useReadingStore} from '../store/useReadingStore';

export const useUnsyncedReadingsCount = () => {
  return useReadingStore(
    state => state.readings.filter(reading => !reading.uploaded).length,
  );
};
