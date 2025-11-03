import PatientService from '../firebase/PatientService';
import ReadingService from '../firebase/ReadingService';
import {
  PatientCreatePayload,
  PatientDetail,
  PatientSummary,
  PatientUpdatePayload,
  ReadingPayload,
} from '../../types/models';

export const fetchPatients = async (): Promise<PatientSummary[]> => {
  return PatientService.listPatients();
};

export const fetchPatientDetail = async (
  patientId: string,
): Promise<PatientDetail & {readings?: ReadingPayload[]}> => {
  const [detail, readings] = await Promise.all([
    PatientService.getPatientDetail(patientId),
    PatientService.getPatientReadings(patientId),
  ]);

  if (!detail) {
    throw new Error('Patient not found');
  }

  return {
    ...detail,
    readings,
  };
};

export const uploadReadings = async (payload: ReadingPayload[]) => {
  if (payload.length === 0) {
    return;
  }
  await ReadingService.upsertReadings(payload);
};

export const createPatient = async (
  payload: PatientCreatePayload,
): Promise<PatientDetail> => {
  return PatientService.createPatient(payload);
};

export const updatePatient = async (
  payload: PatientUpdatePayload,
): Promise<PatientDetail> => {
  return PatientService.updatePatient(payload);
};

export const archivePatient = async (patientId: string) => {
  await PatientService.archivePatient(patientId);
};

export const deletePatient = async (patientId: string) => {
  await PatientService.deletePatient(patientId);
};
