import {useEffect} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
  QueryKey,
} from '@tanstack/react-query';
import {useFirebaseDoctor} from '../../services/hooks/useFirebaseHealth';
import DoctorPatientLinkService from '../../services/firebase/DoctorPatientLinkService';
import type {LinkedPatient} from '../../types/models';
import type {Appointment} from '../../services/firebase/health';

export const doctorKeys = {
  base: ['doctor'] as const,
  appointments: (doctorId?: string | null) =>
    [...doctorKeys.base, doctorId ?? 'unknown', 'appointments'] as const,
  linkedPatients: (doctorId?: string | null) =>
    [...doctorKeys.base, doctorId ?? 'unknown', 'patients'] as const,
};

export const useDoctorAppointmentsQuery = (
  options?: UseQueryOptions<Appointment[], Error, Appointment[], QueryKey>,
) => {
  const {doctorId, getDoctorAppointments, onAppointmentsChange} =
    useFirebaseDoctor();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: doctorKeys.appointments(doctorId),
    queryFn: () => getDoctorAppointments(),
    enabled: Boolean(doctorId),
    staleTime: 30 * 1000,
    ...options,
  });

  useEffect(() => {
    if (!doctorId) {
      return;
    }
    const unsubscribe = onAppointmentsChange(appointments => {
      queryClient.setQueryData(doctorKeys.appointments(doctorId), appointments);
    });
    return unsubscribe;
  }, [doctorId, onAppointmentsChange, queryClient]);

  return query;
};

export const useLinkedPatientsQuery = (
  options?: UseQueryOptions<LinkedPatient[], Error, LinkedPatient[], QueryKey>,
) => {
  const {doctorId} = useFirebaseDoctor();

  return useQuery({
    queryKey: doctorKeys.linkedPatients(doctorId),
    queryFn: async () => {
      if (!doctorId) {
        return [];
      }
      return DoctorPatientLinkService.getLinkedPatients(doctorId);
    },
    enabled: Boolean(doctorId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

type UpdateAppointmentVariables = {
  appointmentId: string;
  status: Appointment['status'];
  notes?: string;
};

export const useUpdateAppointmentStatusMutation = (
  options?: UseMutationOptions<
    void,
    Error,
    UpdateAppointmentVariables,
    unknown
  >,
) => {
  const {doctorId, updateAppointmentStatus} = useFirebaseDoctor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({appointmentId, status, notes}) =>
      updateAppointmentStatus(appointmentId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: doctorKeys.appointments(doctorId),
      });
    },
    ...options,
  });
};
