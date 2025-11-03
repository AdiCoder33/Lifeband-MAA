import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  archiveDoctorReview,
  createDoctorReview,
  deleteDoctorReview,
  updateDoctorReview,
} from '../../services/api/doctorReviewApi';
import {
  DoctorReview,
  DoctorReviewPayload,
} from '../../types/models';
import {doctorReviewKeys} from './queries';

export const useCreateDoctorReviewMutation = (
  patientId: string,
  doctorId: string,
  authorId?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DoctorReviewPayload) =>
      createDoctorReview(patientId, doctorId, payload, authorId),
    onSuccess: review => {
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, doctorId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, 'all'),
      });
      queryClient.setQueryData(doctorReviewKeys.list(patientId, doctorId), (existing?: DoctorReview[]) => {
        if (!existing) {
          return [review];
        }
        return [review, ...existing];
      });
    },
  });
};

export const useUpdateDoctorReviewMutation = (
  patientId: string,
  doctorId?: string,
  authorId?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: Partial<DoctorReviewPayload>;
    }) => updateDoctorReview(reviewId, payload, authorId),
    onSuccess: review => {
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, doctorId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, 'all'),
      });
      queryClient.setQueryData(doctorReviewKeys.list(patientId, doctorId), (existing?: DoctorReview[]) =>
        existing
          ? existing.map(item => (item.id === review.id ? review : item))
          : [review],
      );
    },
  });
};

export const useDeleteDoctorReviewMutation = (
  patientId: string,
  doctorId?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteDoctorReview(reviewId),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, doctorId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, 'all'),
      });
      queryClient.setQueryData(doctorReviewKeys.list(patientId, doctorId), (existing?: DoctorReview[]) =>
        existing ? existing.filter(item => item.id !== reviewId) : [],
      );
    },
  });
};

export const useArchiveDoctorReviewMutation = (
  patientId: string,
  doctorId?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => archiveDoctorReview(reviewId),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, doctorId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorReviewKeys.list(patientId, 'all'),
      });
      queryClient.setQueryData(doctorReviewKeys.list(patientId, doctorId), (existing?: DoctorReview[]) =>
        existing ? existing.filter(item => item.id !== reviewId) : [],
      );
    },
  });
};
