import DoctorReviewService from '../firebase/DoctorReviewService';
import {
  DoctorReview,
  DoctorReviewPayload,
} from '../../types/models';

export const fetchDoctorReviews = async (
  patientId: string,
  doctorId?: string,
): Promise<DoctorReview[]> =>
  DoctorReviewService.listReviews(patientId, doctorId);

export const createDoctorReview = async (
  patientId: string,
  doctorId: string,
  payload: DoctorReviewPayload,
  authorId?: string,
): Promise<DoctorReview> =>
  DoctorReviewService.createReview(patientId, doctorId, payload, authorId);

export const updateDoctorReview = async (
  reviewId: string,
  payload: Partial<DoctorReviewPayload>,
  authorId?: string,
): Promise<DoctorReview> =>
  DoctorReviewService.updateReview(reviewId, payload, authorId);

export const deleteDoctorReview = async (reviewId: string): Promise<void> =>
  DoctorReviewService.deleteReview(reviewId);

export const archiveDoctorReview = async (reviewId: string): Promise<void> =>
  DoctorReviewService.archiveReview(reviewId);
