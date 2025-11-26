export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type UserRole = 'patient' | 'doctor' | 'asha';

export type DoctorPatientLinkStatus = 'pending' | 'active' | 'revoked';

export interface PregnancyProfile {
  monthsPregnant: number;
  extraDays?: number;
  preferredCheckupTime?: string;
  currentWeightKg?: number;
  recordedAt: string;
}

export interface PatientSummary {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  village?: string;
  riskLevel?: RiskLevel;
  lastReadingAt?: string;
  pregnancy?: PregnancyProfile;
}

export interface PatientDetail extends PatientSummary {
  phone?: string;
  notes?: string;
}

export interface ReadingPayload {
  id?: string;
  patientId: string;
  heartRate: number;
  spo2: number;
  hrv: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  timestamp: string;
  uploaded: boolean;
  syncedAt?: string | null;
  babyMovement?: number; // Baby's movement in movements/hr
  stressLevel?: number; // Mother's stress level in percentage
}

export interface RiskFeedItem {
  patientId: string;
  patientName: string;
  risk: RiskLevel;
  message?: string;
  receivedAt: string;
}

export interface DoctorPatientLink {
  id: string;
  doctorId: string;
  patientId: string;
  status: DoctorPatientLinkStatus;
  createdAt: string;
  createdBy: 'doctor' | 'patient';
  revokedAt?: string;
  lastReportSubmittedAt?: string;
}

export interface DoctorSummary {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  hospital?: string;
  photoUrl?: string;
  qualifications?: string[];
}

export interface MonthlyReportSummary {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  recommendations?: string;
  createdAt: string;
  createdAtMs: number;
}

export interface MonthlyReport extends MonthlyReportSummary {
  linkId: string;
  vitalsSnapshot?: {
    heartRate?: number;
    spo2?: number;
    systolic?: number;
    diastolic?: number;
    temperature?: number;
  };
}

export interface MonthlyReportPayload {
  doctorId: string;
  patientId: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  recommendations?: string;
  vitalsSnapshot?: {
    heartRate?: number;
    spo2?: number;
    systolic?: number;
    diastolic?: number;
    temperature?: number;
  };
}

export interface DoctorInvite {
  id: string;
  doctorId: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  usesRemaining: number;
  maxUses: number;
  label?: string | null;
}

export interface LinkedDoctor extends DoctorSummary {
  linkId: string;
  linkStatus: DoctorPatientLinkStatus;
  linkedAt: string;
  lastReportSubmittedAt?: string;
  latestReport?: MonthlyReportSummary;
}

export interface LinkedPatient {
  linkId: string;
  patientId: string;
  patientName: string;
  status: DoctorPatientLinkStatus;
  linkedAt: string;
  lastReadingAt?: string;
  lastReportSubmittedAt?: string;
  age?: number;
  village?: string;
}

export interface PatientCreatePayload {
  name: string;
  age?: number;
  gender?: string;
  village?: string;
  phone?: string;
  riskLevel?: RiskLevel;
  notes?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  assignedDoctorIds?: string[];
  assignedAshaIds?: string[];
  userId?: string;
  pregnancy?: PregnancyProfile;
}

export interface PatientUpdatePayload extends Partial<PatientCreatePayload> {
  id: string;
  archived?: boolean;
}

export type DoctorReviewStatus = 'draft' | 'submitted' | 'archived';

export interface DoctorReview {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  summary?: string;
  notes: string;
  attachments?: string[];
  status: DoctorReviewStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  lastEditedBy?: string;
}

export interface DoctorReviewPayload {
  title: string;
  notes: string;
  summary?: string;
  attachments?: string[];
  status?: DoctorReviewStatus;
}
