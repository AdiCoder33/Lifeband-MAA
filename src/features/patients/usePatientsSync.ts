import {useEffect} from 'react';
import {PatientDetail, PatientSummary, ReadingPayload} from '../../types/models';
import {useReadingStore, readingStore} from '../../store/useReadingStore';

export const useSyncPatientsList = (patients?: PatientSummary[]) => {
  const upsertPatients = useReadingStore(state => state.upsertPatients);

  useEffect(() => {
    if (patients && patients.length) {
      upsertPatients(patients);
    }
  }, [patients, upsertPatients]);
};

export const useSyncPatientDetail = (
  detail?: PatientDetail,
  readings?: ReadingPayload[],
) => {
  const upsertPatientDetail = useReadingStore(state => state.upsertPatientDetail);

  useEffect(() => {
    if (detail) {
      upsertPatientDetail(detail);
    }
  }, [detail, upsertPatientDetail]);

  useEffect(() => {
    if (!detail?.id || !readings?.length) {
      return;
    }
    const {addReading} = readingStore.getState();
    readings.forEach(payload => {
      addReading({
        ...payload,
        uploaded: payload.uploaded ?? true,
      });
    });
  }, [detail?.id, readings]);
};
