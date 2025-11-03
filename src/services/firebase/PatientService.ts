import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {
  Collections,
  FirebaseFirestore,
} from './config';
import type {
  PatientCreatePayload,
  PatientDetail,
  PatientSummary,
  PatientUpdatePayload,
  ReadingPayload,
  RiskLevel,
} from '../../types/models';

const DEFAULT_RISK: RiskLevel = 'LOW';

const patientsCollection = () =>
  FirebaseFirestore().collection(Collections.PATIENTS);

const readingsCollection = () =>
  FirebaseFirestore().collection(Collections.HEALTH_READINGS);

const toRiskLevel = (value?: unknown): RiskLevel => {
  const normalised =
    typeof value === 'string' ? value.toUpperCase() : DEFAULT_RISK;
  if (normalised === 'HIGH' || normalised === 'MODERATE' || normalised === 'LOW') {
    return normalised;
  }
  return DEFAULT_RISK;
};

const docData = <T = FirebaseFirestoreTypes.DocumentData>(
  snapshot: FirebaseFirestoreTypes.DocumentSnapshot,
): T | undefined => (snapshot.exists ? (snapshot.data() as T) : undefined);

const buildSummary = (
  doc: FirebaseFirestoreTypes.DocumentSnapshot,
): PatientSummary => {
  const data = docData<Record<string, any>>(doc) ?? {};
  return {
    id: doc.id,
    name: data.name ?? data.fullName ?? 'Unnamed patient',
    age: typeof data.age === 'number' ? data.age : undefined,
    gender: data.gender,
    village: data.village ?? data.addressVillage,
    riskLevel: toRiskLevel(data.riskLevel),
    lastReadingAt: data.lastReadingAt,
  };
};

const buildDetail = (
  doc: FirebaseFirestoreTypes.DocumentSnapshot,
): PatientDetail => {
  const summary = buildSummary(doc);
  const data = docData<Record<string, any>>(doc) ?? {};
  return {
    ...summary,
    phone: data.phone ?? data.phoneNumber,
    notes: data.notes ?? data.clinicalNotes,
  };
};

const normalisePayload = (
  payload: Partial<PatientCreatePayload | PatientUpdatePayload>,
) => ({
  ...payload,
  riskLevel: payload.riskLevel
    ? toRiskLevel(payload.riskLevel).toUpperCase()
    : undefined,
  assignedDoctorIds: payload.assignedDoctorIds
    ? Array.from(new Set(payload.assignedDoctorIds.filter(Boolean)))
    : undefined,
  assignedAshaIds: payload.assignedAshaIds
    ? Array.from(new Set(payload.assignedAshaIds.filter(Boolean)))
    : undefined,
});

class PatientService {
  static async listPatients(
    doctorId?: string | null,
  ): Promise<PatientSummary[]> {
    let query: FirebaseFirestoreTypes.Query = patientsCollection();

    if (doctorId) {
      query = query.where('assignedDoctorIds', 'array-contains', doctorId);
    }

    const snapshot = await query.get();
    return snapshot.docs
      .filter(doc => doc.data()?.archived !== true)
      .map(buildSummary);
  }

  static async getPatientDetail(
    patientId: string,
  ): Promise<PatientDetail | null> {
    if (!patientId) {
      return null;
    }

    const snapshot = await patientsCollection().doc(patientId).get();
    if (!snapshot.exists) {
      return null;
    }
    if (snapshot.data()?.archived) {
      return null;
    }
    return buildDetail(snapshot);
  }

  static async getPatientReadings(
    patientId: string,
    limit = 120,
  ): Promise<ReadingPayload[]> {
    if (!patientId) {
      return [];
    }

    const snapshot = await readingsCollection()
      .where('patientId', '==', patientId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        patientId: data.patientId,
        heartRate: Number(data.heartRate ?? 0),
        spo2: Number(data.spo2 ?? 0),
        hrv: Number(data.hrv ?? 0),
        systolic: Number(data.systolic ?? 0),
        diastolic: Number(data.diastolic ?? 0),
        temperature: Number(data.temperature ?? 0),
        timestamp:
          typeof data.timestamp === 'string'
            ? data.timestamp
            : new Date(data.timestamp ?? Date.now()).toISOString(),
        uploaded: data.uploaded ?? true,
        syncedAt: data.syncedAt ?? null,
        babyMovement: data.babyMovement,
        stressLevel: data.stressLevel,
      } satisfies ReadingPayload;
    });
  }

  static async createPatient(
    payload: PatientCreatePayload,
  ): Promise<PatientDetail> {
    const now = new Date().toISOString();
    const prepared = normalisePayload(payload);
    const docRef = payload.userId
      ? patientsCollection().doc(payload.userId)
      : patientsCollection().doc();

    const record = {
      ...prepared,
      name: prepared.name ?? 'Unnamed patient',
      createdAt: now,
      updatedAt: now,
      archived: false,
    };

    await docRef.set(record);
    const snapshot = await docRef.get();
    return buildDetail(snapshot);
  }

  static async updatePatient(
    payload: PatientUpdatePayload,
  ): Promise<PatientDetail> {
    const {id, ...updates} = payload;
    const docRef = patientsCollection().doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      throw new Error('Patient not found');
    }

    const now = new Date().toISOString();
    const prepared = {
      ...normalisePayload(updates),
      updatedAt: now,
    };

    await docRef.set(prepared, {merge: true});
    const fresh = await docRef.get();
    return buildDetail(fresh);
  }

  static async archivePatient(patientId: string): Promise<void> {
    const docRef = patientsCollection().doc(patientId);
    const now = new Date().toISOString();
    await docRef.set(
      {
        archived: true,
        archivedAt: now,
        updatedAt: now,
      },
      {merge: true},
    );
  }

  static async deletePatient(patientId: string): Promise<void> {
    await patientsCollection().doc(patientId).delete();
  }
}

export default PatientService;
