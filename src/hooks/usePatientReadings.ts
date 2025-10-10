import {useMemo} from 'react';
import {useReadingStore} from '../store/useReadingStore';

export const usePatientReadings = (
  patientId?: string,
  options?: {days?: number},
) => {
  const readings = useReadingStore(state => state.readings);
  const getReadings = useReadingStore(state => state.getReadings);

  return useMemo(() => {
    if (!patientId) {
      return [];
    }
    return getReadings(patientId, options?.days);
  }, [getReadings, options?.days, patientId, readings]);
};
