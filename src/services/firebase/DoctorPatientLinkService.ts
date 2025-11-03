import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {Collections, FirebaseFirestore} from './config';
import type {
  DoctorInvite,
  DoctorPatientLink,
  DoctorSummary,
  LinkedDoctor,
  LinkedPatient,
  MonthlyReport,
  MonthlyReportPayload,
  MonthlyReportSummary,
} from '../../types/models';

const LINK_STATUS_ACTIVE = 'active';
const LINK_STATUS_REVOKED = 'revoked';
const LINK_STATUS_PENDING = 'pending';
const DEFAULT_INVITE_EXPIRY_HOURS = 48;
const DEFAULT_INVITE_MAX_USES = 5;

type CreateInviteOptions = {
  expiresInHours?: number;
  maxUses?: number;
  label?: string | null;
};

type RedeemInviteParams = {
  inviteId: string;
  code: string;
  patientId: string;
};

type SubmitMonthlyReportParams = MonthlyReportPayload;

class DoctorPatientLinkService {
  static async createInvite(
    doctorId: string,
    options: CreateInviteOptions = {},
  ): Promise<DoctorInvite> {
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const expiresInHours = options.expiresInHours ?? DEFAULT_INVITE_EXPIRY_HOURS;
    const expiresAtMs = now + expiresInHours * 60 * 60 * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();
    const maxUses = Math.max(1, options.maxUses ?? DEFAULT_INVITE_MAX_USES);
    const code = this.generateInviteCode();

    const inviteRef = FirebaseFirestore()
      .collection(Collections.DOCTOR_INVITES)
      .doc();

    const invite: DoctorInvite = {
      id: inviteRef.id,
      doctorId,
      code,
      createdAt: nowIso,
      expiresAt: expiresAtIso,
      usesRemaining: maxUses,
      maxUses,
      label: options.label ?? null,
    };

    await inviteRef.set({
      ...invite,
      createdAtMs: now,
      expiresAtMs,
      lastRedeemedAt: null,
      revokedAt: null,
    });

    return invite;
  }

  static async listInvites(doctorId: string): Promise<DoctorInvite[]> {
    const snapshot = await FirebaseFirestore()
      .collection(Collections.DOCTOR_INVITES)
      .where('doctorId', '==', doctorId)
      .orderBy('createdAtMs', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        doctorId: data.doctorId,
        code: data.code,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        usesRemaining: data.usesRemaining ?? 0,
        maxUses: data.maxUses ?? 1,
        label: data.label ?? null,
      } satisfies DoctorInvite;
    });
  }

  static async revokeInvite(inviteId: string): Promise<void> {
    await FirebaseFirestore()
      .collection(Collections.DOCTOR_INVITES)
      .doc(inviteId)
      .set(
        {
          usesRemaining: 0,
          revokedAt: new Date().toISOString(),
        },
        {merge: true},
      );
  }

  static async redeemInvite(params: RedeemInviteParams): Promise<DoctorPatientLink> {
    const {inviteId, code, patientId} = params;
    const inviteRef = FirebaseFirestore()
      .collection(Collections.DOCTOR_INVITES)
      .doc(inviteId);
    const inviteSnapshot = await inviteRef.get();

    if (!inviteSnapshot.exists) {
      throw new Error('Doctor invite not found. Please request a new QR code.');
    }

    const inviteData = inviteSnapshot.data() as Record<string, any>;
    const now = Date.now();

    if ((inviteData.code as string | undefined)?.trim().toUpperCase() !== code.trim().toUpperCase()) {
      throw new Error('Invalid invitation code. Please scan again or ask for a new QR code.');
    }

    if (typeof inviteData.expiresAtMs === 'number' && inviteData.expiresAtMs < now) {
      throw new Error('This invitation QR code has expired. Please request a new one from the doctor.');
    }

    if (typeof inviteData.usesRemaining === 'number' && inviteData.usesRemaining <= 0) {
      throw new Error('This invitation has already been used. Ask the doctor for a fresh QR code.');
    }

    // Ensure there is no active link already in place
    const existingLinkSnapshot = await FirebaseFirestore()
      .collection(Collections.DOCTOR_PATIENT_LINKS)
      .where('doctorId', '==', inviteData.doctorId)
      .where('patientId', '==', patientId)
      .where('status', '==', LINK_STATUS_ACTIVE)
      .limit(1)
      .get();

    if (!existingLinkSnapshot.empty) {
      throw new Error('You are already connected to this doctor.');
    }

    const linkRef = FirebaseFirestore()
      .collection(Collections.DOCTOR_PATIENT_LINKS)
      .doc();
    const createdAtIso = new Date(now).toISOString();

    const link: DoctorPatientLink = {
      id: linkRef.id,
      doctorId: inviteData.doctorId,
      patientId,
      status: LINK_STATUS_ACTIVE,
      createdAt: createdAtIso,
      createdBy: 'patient',
      lastReportSubmittedAt: null,
    };

    await linkRef.set({
      ...link,
      createdAtMs: now,
    });

    await inviteRef.update({
      usesRemaining: firestore.FieldValue.increment(-1),
      lastRedeemedAt: createdAtIso,
    });

    await Promise.all([
      this.ensureUserLinkArray(patientId, inviteData.doctorId),
      this.ensureDoctorPatientArray(inviteData.doctorId, patientId),
    ]);

    return link;
  }

  static async unlinkDoctor(linkId: string, reason?: string): Promise<void> {
    const linkRef = FirebaseFirestore()
      .collection(Collections.DOCTOR_PATIENT_LINKS)
      .doc(linkId);

    const snapshot = await linkRef.get();
    const linkData = snapshot.data() as Record<string, any> | undefined;

    await linkRef.set(
      {
        status: LINK_STATUS_REVOKED,
        revokedAt: new Date().toISOString(),
        revokeReason: reason ?? null,
      },
      {merge: true},
    );

    if (linkData?.patientId && linkData?.doctorId) {
      await Promise.all([
        FirebaseFirestore()
          .collection(Collections.USERS)
          .doc(linkData.patientId as string)
          .set(
            {
              linkedDoctorIds: firestore.FieldValue.arrayRemove(
                linkData.doctorId,
              ),
            },
            {merge: true},
          ),
        FirebaseFirestore()
          .collection(Collections.USERS)
          .doc(linkData.doctorId as string)
          .set(
            {
              linkedPatientIds: firestore.FieldValue.arrayRemove(
                linkData.patientId,
              ),
            },
            {merge: true},
          ),
      ]);
    }
  }

  static async getLinkedDoctors(patientId: string): Promise<LinkedDoctor[]> {
    const snapshot = await FirebaseFirestore()
      .collection(Collections.DOCTOR_PATIENT_LINKS)
      .where('patientId', '==', patientId)
      .where('status', '==', LINK_STATUS_ACTIVE)
      .orderBy('createdAtMs', 'desc')
      .get();

    const links = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>),
    }));

    const doctors = await Promise.all(
      links.map(async link => {
        const doctorProfile = await this.fetchDoctorSummary(link.doctorId);
        const latestReport = await this.fetchLatestReport(link.doctorId, patientId);

        return {
          linkId: link.id,
          linkStatus: link.status as LinkedDoctor['linkStatus'],
          linkedAt: link.createdAt as string,
          lastReportSubmittedAt: link.lastReportSubmittedAt as string | undefined,
          latestReport,
          ...doctorProfile,
        } satisfies LinkedDoctor;
      }),
    );

    return doctors;
  }

  static async getLinkedPatients(doctorId: string): Promise<LinkedPatient[]> {
    const snapshot = await FirebaseFirestore()
      .collection(Collections.DOCTOR_PATIENT_LINKS)
      .where('doctorId', '==', doctorId)
      .where('status', '==', LINK_STATUS_ACTIVE)
      .orderBy('createdAtMs', 'desc')
      .get();

    const links = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>),
    }));

    const patients = await Promise.all(
      links.map(async link => {
        const patientProfile = await this.fetchPatientSummary(link.patientId);
        return {
          linkId: link.id,
          patientId: link.patientId as string,
          patientName: patientProfile.name,
          status: link.status as LinkedPatient['status'],
          linkedAt: link.createdAt as string,
          lastReadingAt: patientProfile.lastReadingAt,
          lastReportSubmittedAt: link.lastReportSubmittedAt as string | undefined,
          age: patientProfile.age,
          village: patientProfile.village,
        } satisfies LinkedPatient;
      }),
    );

    return patients;
  }

  static async submitMonthlyReport(
    payload: SubmitMonthlyReportParams,
  ): Promise<MonthlyReport> {
    const {doctorId, patientId, periodStart, periodEnd, summary} = payload;

    if (!summary.trim()) {
      throw new Error('Please provide a summary for the monthly report.');
    }

    const linkSnapshot = await FirebaseFirestore()
      .collection(Collections.DOCTOR_PATIENT_LINKS)
      .where('doctorId', '==', doctorId)
      .where('patientId', '==', patientId)
      .where('status', '==', LINK_STATUS_ACTIVE)
      .limit(1)
      .get();

    if (linkSnapshot.empty) {
      throw new Error('Doctor is not currently linked to this patient.');
    }

    const linkDoc = linkSnapshot.docs[0];
    const linkId = linkDoc.id;

    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const reportRef = FirebaseFirestore()
      .collection(Collections.MONTHLY_REPORTS)
      .doc();

    const doctorInfo = await this.fetchDoctorSummary(doctorId);

    const report: MonthlyReport = {
      id: reportRef.id,
      doctorId,
      doctorName: doctorInfo.name,
      patientId,
      periodStart,
      periodEnd,
      summary: payload.summary,
      recommendations: payload.recommendations,
      createdAt: nowIso,
      createdAtMs: now,
      linkId,
      vitalsSnapshot: payload.vitalsSnapshot,
    };

    await reportRef.set(report);

    await linkDoc.ref.set(
      {
        lastReportSubmittedAt: nowIso,
      },
      {merge: true},
    );

    return report;
  }

  static async getMonthlyReportsForPatient(
    patientId: string,
  ): Promise<MonthlyReportSummary[]> {
    const snapshot = await FirebaseFirestore()
      .collection(Collections.MONTHLY_REPORTS)
      .where('patientId', '==', patientId)
      .orderBy('createdAtMs', 'desc')
      .get();

    const reports = snapshot.docs.map(doc => doc.data() as MonthlyReport);
    const doctorIds = Array.from(
      new Set(reports.map(report => report.doctorId)),
    );
    const doctorProfiles = await this.fetchDoctorSummaries(doctorIds);

    return reports.map(report => ({
      id: report.id,
      doctorId: report.doctorId,
      doctorName: report.doctorName ?? doctorProfiles.get(report.doctorId)?.name,
      patientId: report.patientId,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      summary: report.summary,
      recommendations: report.recommendations,
      createdAt: report.createdAt,
      createdAtMs: report.createdAtMs,
    }));
  }

  static async getMonthlyReportsForDoctor(
    doctorId: string,
    patientId?: string,
  ): Promise<MonthlyReportSummary[]> {
    let query: FirebaseFirestoreTypes.Query = FirebaseFirestore()
      .collection(Collections.MONTHLY_REPORTS)
      .where('doctorId', '==', doctorId);

    if (patientId) {
      query = query.where('patientId', '==', patientId);
    }

    const snapshot = await query.orderBy('createdAtMs', 'desc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data() as MonthlyReport;
      return {
        id: data.id,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        patientId: data.patientId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        summary: data.summary,
        recommendations: data.recommendations,
        createdAt: data.createdAt,
        createdAtMs: data.createdAtMs,
      };
    });
  }

  private static async ensureUserLinkArray(
    patientId: string,
    doctorId: string,
  ) {
    await FirebaseFirestore()
      .collection(Collections.USERS)
      .doc(patientId)
      .set(
        {
          linkedDoctorIds: firestore.FieldValue.arrayUnion(doctorId),
        },
        {merge: true},
      );
  }

  private static async ensureDoctorPatientArray(
    doctorId: string,
    patientId: string,
  ) {
    await FirebaseFirestore()
      .collection(Collections.USERS)
      .doc(doctorId)
      .set(
        {
          linkedPatientIds: firestore.FieldValue.arrayUnion(patientId),
        },
        {merge: true},
      );
  }

  private static async fetchDoctorSummary(
    doctorId: string,
  ): Promise<DoctorSummary> {
    const [userDoc, doctorDoc] = await Promise.all([
      FirebaseFirestore().collection(Collections.USERS).doc(doctorId).get(),
      FirebaseFirestore().collection(Collections.DOCTORS).doc(doctorId).get(),
    ]);

    const userData = userDoc.data() as Record<string, any> | undefined;
    const doctorData = doctorDoc.data() as Record<string, any> | undefined;

    return {
      id: doctorId,
      name: userData?.name ?? 'Doctor',
      email: userData?.email,
      phoneNumber: doctorData?.phoneNumber ?? userData?.phoneNumber,
      specialization: doctorData?.specialization,
      hospital: doctorData?.hospital,
      photoUrl: doctorData?.photoUrl ?? userData?.photoUrl,
      qualifications: doctorData?.qualifications,
    };
  }

  private static async fetchDoctorSummaries(
    doctorIds: string[],
  ): Promise<Map<string, DoctorSummary>> {
    const entries = await Promise.all(
      doctorIds.map(async doctorId => {
        const summary = await this.fetchDoctorSummary(doctorId);
        return [doctorId, summary] as const;
      }),
    );

    return new Map(entries);
  }

  private static async fetchPatientSummary(
    patientId: string,
  ): Promise<{
    name: string;
    lastReadingAt?: string;
    age?: number;
    village?: string;
  }> {
    const [userDoc, patientDoc] = await Promise.all([
      FirebaseFirestore().collection(Collections.USERS).doc(patientId).get(),
      FirebaseFirestore().collection(Collections.PATIENTS).doc(patientId).get(),
    ]);

    const userData = userDoc.data() as Record<string, any> | undefined;
    const patientData = patientDoc.data() as Record<string, any> | undefined;

    return {
      name: userData?.name ?? patientData?.name ?? 'Patient',
      lastReadingAt: patientData?.lastReadingAt ?? userData?.lastReadingAt,
      age: patientData?.age ?? userData?.age,
      village: patientData?.village ?? userData?.village,
    };
  }

  private static async fetchLatestReport(
    doctorId: string,
    patientId: string,
  ): Promise<MonthlyReportSummary | undefined> {
    const snapshot = await FirebaseFirestore()
      .collection(Collections.MONTHLY_REPORTS)
      .where('doctorId', '==', doctorId)
      .where('patientId', '==', patientId)
      .orderBy('createdAtMs', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return undefined;
    }

    const data = snapshot.docs[0].data() as MonthlyReport;
    return {
      id: data.id,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      patientId: data.patientId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      summary: data.summary,
      recommendations: data.recommendations,
      createdAt: data.createdAt,
      createdAtMs: data.createdAtMs,
    };
  }

  private static generateInviteCode(length = 6): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let index = 0; index < length; index += 1) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
}

export default DoctorPatientLinkService;
