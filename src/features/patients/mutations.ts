import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  archivePatient,
  createPatient,
  deletePatient,
  updatePatient,
} from '../../services/api/patientApi';
import type {
  PatientCreatePayload,
  PatientDetail,
  PatientUpdatePayload,
} from '../../types/models';
import {patientsKeys} from './queries';

export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientCreatePayload) => createPatient(payload),
    onSuccess: (patient: PatientDetail) => {
      queryClient.invalidateQueries({queryKey: patientsKeys.list()});
      queryClient.setQueryData(patientsKeys.detail(patient.id), patient);
    },
  });
};

export const useUpdatePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientUpdatePayload) => updatePatient(payload),
    onSuccess: (patient: PatientDetail) => {
      queryClient.invalidateQueries({queryKey: patientsKeys.list()});
      queryClient.setQueryData(patientsKeys.detail(patient.id), patient);
    },
  });
};

export const useArchivePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => archivePatient(patientId),
    onSuccess: (_, patientId) => {
      queryClient.invalidateQueries({queryKey: patientsKeys.list()});
      queryClient.removeQueries({queryKey: patientsKeys.detail(patientId)});
    },
  });
};

export const useDeletePatientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onSuccess: (_, patientId) => {
      queryClient.invalidateQueries({queryKey: patientsKeys.list()});
      queryClient.removeQueries({queryKey: patientsKeys.detail(patientId)});
    },
  });
};
