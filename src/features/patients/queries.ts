import {useQuery, UseQueryOptions, QueryKey} from '@tanstack/react-query';
import {
  fetchPatientDetail,
  fetchPatients,
} from '../../services/api/patientApi';
import {PatientDetail, PatientSummary} from '../../types/models';

export const patientsKeys = {
  all: ['patients'] as const,
  list: () => [...patientsKeys.all, 'list'] as const,
  detail: (id: string) => [...patientsKeys.all, 'detail', id] as const,
};

export const usePatientsQuery = (
  options?: UseQueryOptions<PatientSummary[], Error, PatientSummary[], QueryKey>,
) =>
  useQuery({
    queryKey: patientsKeys.list(),
    queryFn: fetchPatients,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const usePatientDetailQuery = (
  patientId?: string,
  options?: UseQueryOptions<
    PatientDetail & {readings?: unknown},
    Error,
    PatientDetail & {readings?: unknown},
    QueryKey
  >,
) =>
  useQuery({
    queryKey: patientsKeys.detail(patientId ?? 'unknown'),
    queryFn: () => fetchPatientDetail(patientId ?? ''),
    enabled: Boolean(patientId),
    staleTime: 60 * 1000,
    ...options,
  });
