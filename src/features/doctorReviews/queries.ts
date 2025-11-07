import {useQuery, UseQueryOptions, QueryKey} from '@tanstack/react-query';
import {
  fetchDoctorReviews,
  fetchRecentDoctorReviews,
} from '../../services/api/doctorReviewApi';
import {DoctorReview} from '../../types/models';
import {useFirebaseDoctor} from '../../services/hooks/useFirebaseHealth';

export const doctorReviewKeys = {
  base: ['doctorReviews'] as const,
  list: (patientId: string, doctorId?: string) =>
    [...doctorReviewKeys.base, patientId, doctorId ?? 'all'] as const,
  recent: (doctorId?: string | null, limit?: number) =>
    [...doctorReviewKeys.base, doctorId ?? 'unknown', 'recent', limit ?? 'all'] as const,
};

export const useDoctorReviewsQuery = (
  patientId?: string,
  doctorId?: string,
  options?: UseQueryOptions<DoctorReview[], Error, DoctorReview[], QueryKey>,
) =>
  useQuery({
    queryKey: doctorReviewKeys.list(patientId ?? 'unknown', doctorId),
    queryFn: () => fetchDoctorReviews(patientId ?? '', doctorId),
    enabled: Boolean(patientId),
    staleTime: 60 * 1000,
    ...options,
  });

export const useDoctorRecentReviewsQuery = (
  limit = 5,
  options?: UseQueryOptions<DoctorReview[], Error, DoctorReview[], QueryKey>,
) => {
  const {doctorId} = useFirebaseDoctor();
  return useQuery({
    queryKey: doctorReviewKeys.recent(doctorId, limit),
    queryFn: () => fetchRecentDoctorReviews(doctorId ?? '', limit),
    enabled: Boolean(doctorId),
    staleTime: 60 * 1000,
    ...options,
  });
};
