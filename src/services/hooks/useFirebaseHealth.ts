import HealthService from '../firebase/health';
import { useAuth } from '../../context/AuthContext';

// Hook to integrate Firebase health services with your existing screens
export const useFirebaseHealth = () => {
  const { firebaseProfile, user } = useAuth();
  
  const patientId = user?.uid || firebaseProfile?.uid;

  return {
    // Medicine Tracker Integration
    async saveMedicine(medicineData: {
      medicineName: string;
      dosage: string;
      frequency: string;
      timings: string[];
      prescribedBy?: string;
      notes?: string;
    }) {
      if (!patientId) throw new Error('No patient ID found');
      
      return await HealthService.saveMedicineEntry({
        patientId,
        ...medicineData,
        startDate: new Date(),
        takenToday: new Array(medicineData.timings.length).fill(false)
      });
    },

    async getMedicines() {
      if (!patientId) return [];
      return await HealthService.getPatientMedicines(patientId);
    },

    async updateMedicineStatus(medicineId: string, takenToday: boolean[]) {
      return await HealthService.updateMedicineStatus(medicineId, takenToday);
    },

    // Nutrition Guide Integration
    async saveNutritionPlan(week: number, nutritionData: {
      recommendedFoods: string[];
      avoidFoods: string[];
      supplements: string[];
      calories: number;
      protein: number;
      calcium: number;
      iron: number;
    }) {
      if (!patientId) throw new Error('No patient ID found');
      
      return await HealthService.saveNutritionPlan({
        patientId,
        week,
        ...nutritionData,
        createdBy: user?.uid
      });
    },

    async getNutritionPlan(week: number) {
      if (!patientId) return null;
      return await HealthService.getPatientNutritionPlan(patientId, week);
    },

    // Exercise Routine Integration
    async saveExerciseRoutine(week: number, exercises: {
      name: string;
      duration: string;
      description: string;
      difficulty: 'easy' | 'moderate' | 'hard';
    }[]) {
      if (!patientId) throw new Error('No patient ID found');
      
      return await HealthService.saveExerciseRoutine({
        patientId,
        week,
        exercises,
        completedToday: false,
        createdBy: user?.uid
      });
    },

    async getExerciseRoutine(week: number) {
      if (!patientId) return null;
      return await HealthService.getPatientExerciseRoutine(patientId, week);
    },

    // Baby Development Integration
    async saveBabyDevelopment(week: number, developmentData: {
      babySize: string;
      developmentMilestones: string[];
      motherChanges: string[];
      tips: string[];
      nextAppointment?: Date;
    }) {
      if (!patientId) throw new Error('No patient ID found');
      
      return await HealthService.saveBabyDevelopment({
        patientId,
        week,
        ...developmentData
      });
    },

    async getBabyDevelopment(week: number) {
      if (!patientId) return null;
      return await HealthService.getBabyDevelopmentByWeek(patientId, week);
    },

    // Emergency Contacts Integration
    async saveEmergencyContact(contactData: {
      name: string;
      relation: string;
      phone: string;
      address?: string;
      isPrimary: boolean;
    }) {
      if (!patientId) throw new Error('No patient ID found');
      
      return await HealthService.saveEmergencyContact({
        patientId,
        ...contactData
      });
    },

    async getEmergencyContacts() {
      if (!patientId) return [];
      return await HealthService.getPatientEmergencyContacts(patientId);
    },

    // Health Readings Integration (for Lifeband device data)
    async saveHealthReading(readingData: {
      heartRate: number;
      spo2: number;
      hrv: number;
      systolic: number;
      diastolic: number;
      temperature: number;
      babyMovement?: number;
    }) {
      if (!patientId) throw new Error('No patient ID found');
      
      return await HealthService.saveHealthReading({
        patientId,
        timestamp: new Date().toISOString(),
        uploaded: true,
        syncedAt: new Date().toISOString(),
        ...readingData
      });
    },

    async getHealthReadings(limit = 50) {
      if (!patientId) return [];
      return await HealthService.getPatientHealthReadings(patientId, limit);
    },

    // Appointments Integration
    async scheduleAppointment(appointmentData: {
      doctorId?: string;
      ashaId?: string;
      type: 'checkup' | 'consultation' | 'emergency' | 'follow-up';
      scheduledDate: Date;
      duration: number;
      notes?: string;
    }) {
      if (!patientId) throw new Error('No patient ID found');
      
      return await HealthService.scheduleAppointment({
        patientId,
        status: 'scheduled',
        ...appointmentData
      });
    },

    async getAppointments() {
      if (!patientId) return [];
      return await HealthService.getPatientAppointments(patientId);
    },

    // Real-time listeners
    onHealthReadingsChange(callback: (readings: any[]) => void) {
      if (!patientId) return () => {};
      return HealthService.onHealthReadingsChange(patientId, callback);
    },

    onAppointmentsChange(callback: (appointments: any[]) => void) {
      if (!patientId) return () => {};
      return HealthService.onAppointmentsChange(patientId, 'patient', callback);
    }
  };
};

// Doctor-specific hooks
export const useFirebaseDoctor = () => {
  const { user } = useAuth();
  const doctorId = user?.uid;

  return {
    async getDoctorAppointments() {
      if (!doctorId) return [];
      return await HealthService.getDoctorAppointments(doctorId);
    },

    async updateAppointmentStatus(appointmentId: string, status: 'completed' | 'cancelled' | 'rescheduled', notes?: string) {
      return await HealthService.updateAppointmentStatus(appointmentId, status, notes);
    },

    onAppointmentsChange(callback: (appointments: any[]) => void) {
      if (!doctorId) return () => {};
      return HealthService.onAppointmentsChange(doctorId, 'doctor', callback);
    }
  };
};