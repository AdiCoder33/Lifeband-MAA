import {apiClient} from './client';
import {PatientDetail, PatientSummary, ReadingPayload} from '../../types/models';

export const fetchPatients = async (): Promise<PatientSummary[]> => {
  const response = await apiClient.get<{data: PatientSummary[]}>(
    '/api/v1/patients',
  );
  return response.data.data;
};

export const fetchPatientDetail = async (
  patientId: string,
): Promise<PatientDetail & {readings?: ReadingPayload[]}> => {
  const response = await apiClient.get<
    {data: PatientDetail; readings?: ReadingPayload[]}
  >(`/api/v1/patients/${patientId}`);
  const data = response.data;
  return {
    ...data.data,
    readings: data.readings,
  };
};

export const uploadReadings = async (payload: ReadingPayload[]) => {
  if (payload.length === 0) {
    return;
  }
  await apiClient.post('/api/v1/readings', {
    data: payload,
  });
};
