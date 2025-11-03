import {useQuery, UseQueryOptions, QueryKey} from '@tanstack/react-query';
import {
  fetchDoctorReviews,
} from '../../services/api/doctorReviewApi';
import {DoctorReview} from '../../types/models';

export const doctorReviewKeys = {
  base: ['doctorReviews'] as const,
  list: (patientId: string, doctorId?: string) =>
    [...doctorReviewKeys.base, patientId, doctorId ?? 'all'] as const,
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
