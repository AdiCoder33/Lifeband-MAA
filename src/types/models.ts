export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface PatientSummary {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  village?: string;
  riskLevel?: RiskLevel;
  lastReadingAt?: string;
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
