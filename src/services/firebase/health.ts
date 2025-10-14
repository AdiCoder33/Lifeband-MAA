import { FirebaseFirestore, Collections } from './config';
import { ReadingPayload } from '../../types/models';

export interface HealthReading extends ReadingPayload {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineEntry {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  timings: string[];
  takenToday: boolean[];
  prescribedBy?: string; // Doctor ID
  notes?: string;
  createdAt: Date;
}

export interface NutritionPlan {
  id: string;
  patientId: string;
  week: number; // Pregnancy week
  recommendedFoods: string[];
  avoidFoods: string[];
  supplements: string[];
  calories: number;
  protein: number;
  calcium: number;
  iron: number;
  createdBy?: string; // Doctor/ASHA ID
  createdAt: Date;
}

export interface ExerciseRoutine {
  id: string;
  patientId: string;
  week: number; // Pregnancy week
  exercises: {
    name: string;
    duration: string;
    description: string;
    difficulty: 'easy' | 'moderate' | 'hard';
  }[];
  completedToday: boolean;
  createdBy?: string; // Doctor/ASHA ID
  createdAt: Date;
}

export interface BabyDevelopment {
  id: string;
  patientId: string;
  week: number;
  babySize: string;
  developmentMilestones: string[];
  motherChanges: string[];
  tips: string[];
  nextAppointment?: Date;
  createdAt: Date;
}

export interface EmergencyContact {
  id: string;
  patientId: string;
  name: string;
  relation: string;
  phone: string;
  address?: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  ashaId?: string;
  type: 'checkup' | 'consultation' | 'emergency' | 'follow-up';
  scheduledDate: Date;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  prescriptions?: string[];
  createdAt: Date;
}

class HealthService {
  // =================== HEALTH READINGS ===================
  
  async saveHealthReading(reading: Omit<HealthReading, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await FirebaseFirestore()
        .collection(Collections.HEALTH_READINGS)
        .add({
          ...reading,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Save health reading error:', error);
      throw error;
    }
  }

  async getPatientHealthReadings(patientId: string, limit = 50) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.HEALTH_READINGS)
        .where('patientId', '==', patientId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HealthReading));
    } catch (error) {
      console.error('Get patient health readings error:', error);
      throw error;
    }
  }

  // =================== MEDICINE TRACKER ===================
  
  async saveMedicineEntry(medicine: Omit<MedicineEntry, 'id' | 'createdAt'>) {
    try {
      const docRef = await FirebaseFirestore()
        .collection(Collections.MEDICATIONS)
        .add({
          ...medicine,
          createdAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Save medicine entry error:', error);
      throw error;
    }
  }

  async getPatientMedicines(patientId: string) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.MEDICATIONS)
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MedicineEntry));
    } catch (error) {
      console.error('Get patient medicines error:', error);
      throw error;
    }
  }

  async updateMedicineStatus(medicineId: string, takenToday: boolean[]) {
    try {
      await FirebaseFirestore()
        .collection(Collections.MEDICATIONS)
        .doc(medicineId)
        .update({ takenToday });
    } catch (error) {
      console.error('Update medicine status error:', error);
      throw error;
    }
  }

  // =================== NUTRITION PLANS ===================
  
  async saveNutritionPlan(nutrition: Omit<NutritionPlan, 'id' | 'createdAt'>) {
    try {
      const docRef = await FirebaseFirestore()
        .collection(Collections.NUTRITION_PLANS)
        .add({
          ...nutrition,
          createdAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Save nutrition plan error:', error);
      throw error;
    }
  }

  async getPatientNutritionPlan(patientId: string, week: number) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.NUTRITION_PLANS)
        .where('patientId', '==', patientId)
        .where('week', '==', week)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as NutritionPlan;
      }
      return null;
    } catch (error) {
      console.error('Get patient nutrition plan error:', error);
      throw error;
    }
  }

  // =================== EXERCISE ROUTINES ===================
  
  async saveExerciseRoutine(exercise: Omit<ExerciseRoutine, 'id' | 'createdAt'>) {
    try {
      const docRef = await FirebaseFirestore()
        .collection(Collections.EXERCISE_ROUTINES)
        .add({
          ...exercise,
          createdAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Save exercise routine error:', error);
      throw error;
    }
  }

  async getPatientExerciseRoutine(patientId: string, week: number) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.EXERCISE_ROUTINES)
        .where('patientId', '==', patientId)
        .where('week', '==', week)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ExerciseRoutine;
      }
      return null;
    } catch (error) {
      console.error('Get patient exercise routine error:', error);
      throw error;
    }
  }

  // =================== BABY DEVELOPMENT ===================
  
  async saveBabyDevelopment(development: Omit<BabyDevelopment, 'id' | 'createdAt'>) {
    try {
      const docRef = await FirebaseFirestore()
        .collection(Collections.BABY_DEVELOPMENT)
        .add({
          ...development,
          createdAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Save baby development error:', error);
      throw error;
    }
  }

  async getBabyDevelopmentByWeek(patientId: string, week: number) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.BABY_DEVELOPMENT)
        .where('patientId', '==', patientId)
        .where('week', '==', week)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as BabyDevelopment;
      }
      return null;
    } catch (error) {
      console.error('Get baby development error:', error);
      throw error;
    }
  }

  // =================== EMERGENCY CONTACTS ===================
  
  async saveEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'createdAt'>) {
    try {
      const docRef = await FirebaseFirestore()
        .collection(Collections.EMERGENCY_CONTACTS)
        .add({
          ...contact,
          createdAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Save emergency contact error:', error);
      throw error;
    }
  }

  async getPatientEmergencyContacts(patientId: string) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.EMERGENCY_CONTACTS)
        .where('patientId', '==', patientId)
        .orderBy('isPrimary', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmergencyContact));
    } catch (error) {
      console.error('Get patient emergency contacts error:', error);
      throw error;
    }
  }

  // =================== APPOINTMENTS ===================
  
  async scheduleAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>) {
    try {
      const docRef = await FirebaseFirestore()
        .collection(Collections.APPOINTMENTS)
        .add({
          ...appointment,
          createdAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Schedule appointment error:', error);
      throw error;
    }
  }

  async getPatientAppointments(patientId: string) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.APPOINTMENTS)
        .where('patientId', '==', patientId)
        .orderBy('scheduledDate', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
    } catch (error) {
      console.error('Get patient appointments error:', error);
      throw error;
    }
  }

  async getDoctorAppointments(doctorId: string) {
    try {
      const snapshot = await FirebaseFirestore()
        .collection(Collections.APPOINTMENTS)
        .where('doctorId', '==', doctorId)
        .orderBy('scheduledDate', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment));
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status'], notes?: string) {
    try {
      await FirebaseFirestore()
        .collection(Collections.APPOINTMENTS)
        .doc(appointmentId)
        .update({ 
          status,
          ...(notes && { notes })
        });
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  }

  // =================== REAL-TIME LISTENERS ===================
  
  onHealthReadingsChange(patientId: string, callback: (readings: HealthReading[]) => void) {
    return FirebaseFirestore()
      .collection(Collections.HEALTH_READINGS)
      .where('patientId', '==', patientId)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .onSnapshot(snapshot => {
        const readings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as HealthReading));
        callback(readings);
      });
  }

  onAppointmentsChange(userId: string, userRole: 'patient' | 'doctor', callback: (appointments: Appointment[]) => void) {
    const field = userRole === 'patient' ? 'patientId' : 'doctorId';
    
    return FirebaseFirestore()
      .collection(Collections.APPOINTMENTS)
      .where(field, '==', userId)
      .orderBy('scheduledDate', 'desc')
      .onSnapshot(snapshot => {
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Appointment));
        callback(appointments);
      });
  }
}

export default new HealthService();