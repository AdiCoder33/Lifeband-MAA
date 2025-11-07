import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {
  Collections,
  FirebaseFirestore,
} from './config';
import type {
  DoctorReview,
  DoctorReviewPayload,
  DoctorReviewStatus,
} from '../../types/models';

const reviewsCollection = () =>
  FirebaseFirestore().collection(Collections.DOCTOR_REVIEWS);

const mapReview = (
  snapshot: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
): DoctorReview => {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    patientId: data.patientId,
    doctorId: data.doctorId,
    title: data.title ?? 'Review',
    summary: data.summary,
    notes: data.notes ?? '',
    attachments: data.attachments ?? [],
    status:
      (data.status as DoctorReviewStatus | undefined) ??
      ('draft' as DoctorReviewStatus),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt ?? data.createdAt,
    submittedAt: data.submittedAt,
    lastEditedBy: data.lastEditedBy,
  };
};

class DoctorReviewService {
  static async listReviews(
    patientId: string,
    doctorId?: string,
  ): Promise<DoctorReview[]> {
    let query: FirebaseFirestoreTypes.Query = reviewsCollection().where(
      'patientId',
      '==',
      patientId,
    );

    if (doctorId) {
      query = query.where('doctorId', '==', doctorId);
    }

    const snapshot = await query.get();
    return snapshot.docs
      .map(mapReview)
      .filter(review => review.status !== 'archived')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  static async createReview(
    patientId: string,
    doctorId: string,
    payload: DoctorReviewPayload,
    authorId?: string,
  ): Promise<DoctorReview> {
    const now = new Date().toISOString();
    const docRef = reviewsCollection().doc();

    await docRef.set({
      patientId,
      doctorId,
      title: payload.title,
      summary: payload.summary ?? '',
      notes: payload.notes,
      attachments: payload.attachments ?? [],
      status: payload.status ?? 'draft',
      createdAt: now,
      updatedAt: now,
      submittedAt: payload.status === 'submitted' ? now : null,
      lastEditedBy: authorId ?? doctorId,
    });

    const snapshot = await docRef.get();
    return mapReview(snapshot);
  }

  static async updateReview(
    reviewId: string,
    payload: Partial<DoctorReviewPayload>,
    authorId?: string,
  ): Promise<DoctorReview> {
    const docRef = reviewsCollection().doc(reviewId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      throw new Error('Doctor review not found');
    }

    const now = new Date().toISOString();
    const status = payload.status ?? (snapshot.data()?.status as DoctorReviewStatus);

    await docRef.set(
      {
        ...payload,
        attachments: payload.attachments ?? snapshot.data()?.attachments ?? [],
        status,
        submittedAt:
          status === 'submitted'
            ? snapshot.data()?.submittedAt ?? now
            : snapshot.data()?.submittedAt ?? null,
        updatedAt: now,
        lastEditedBy: authorId ?? snapshot.data()?.lastEditedBy,
      },
      {merge: true},
    );

    const fresh = await docRef.get();
    return mapReview(fresh);
  }

  static async deleteReview(reviewId: string): Promise<void> {
    await reviewsCollection().doc(reviewId).delete();
  }

  static async archiveReview(reviewId: string): Promise<void> {
    await reviewsCollection().doc(reviewId).set(
      {
        status: 'archived',
        archivedAt: new Date().toISOString(),
      },
      {merge: true},
    );
  }

  static async listRecentReviews(
    doctorId: string,
    limit = 10,
  ): Promise<DoctorReview[]> {
    const snapshot = await reviewsCollection()
      .where('doctorId', '==', doctorId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs
      .map(mapReview)
      .filter(review => review.status !== 'archived');
  }
}

export default DoctorReviewService;
