import { FirebaseAuth, FirebaseFirestore, Collections, User } from './config';
import { UserRole } from '../../types/models';

export interface FirebaseUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  profilePicture?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export interface PatientProfile extends FirebaseUser {
  role: 'patient';
  dateOfBirth: Date;
  bloodGroup?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  currentPregnancy?: {
    dueDate: Date;
    weeks: number;
    complications?: string[];
  };
  assignedDoctors?: string[]; // Connected doctors
  primaryDoctorId?: string;
  assignedASHA?: string; // ASHA Worker ID
}

export interface DoctorProfile extends FirebaseUser {
  role: 'doctor';
  specialization: string;
  licenseNumber: string;
  hospital: string;
  experienceYears: number;
  qualifications: string[];
  consultationFee?: number;
  availableSlots?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface ASHAProfile extends FirebaseUser {
  role: 'asha';
  registrationNumber: string;
  district: string;
  block: string;
  village: string;
  certifications: string[];
  assignedFamilies: string[]; // Patient IDs
  performanceMetrics?: {
    visitsCompleted: number;
    familiesServed: number;
    referralsMade: number;
    trainingsAttended: number;
  };
}

class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, userInfo: Partial<FirebaseUser>) {
    try {
      const userCredential = await FirebaseAuth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await this.createUserProfile(user.uid, {
        uid: user.uid,
        email: email,
        ...userInfo,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true
      });

      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await FirebaseAuth().signInWithEmailAndPassword(email, password);
      
      // Update last login time
      await this.updateLastLogin(userCredential.user.uid);
      
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await FirebaseAuth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Create user profile in Firestore
  async createUserProfile(uid: string, userInfo: Partial<FirebaseUser>) {
    try {
      const baseProfile = {
        ...userInfo,
        linkedDoctorIds:
          userInfo.role === 'patient'
            ? []
            : (userInfo as Record<string, any>).linkedDoctorIds ?? [],
        linkedPatientIds:
          userInfo.role === 'doctor'
            ? []
            : (userInfo as Record<string, any>).linkedPatientIds ?? [],
      };

      await FirebaseFirestore()
        .collection(Collections.USERS)
        .doc(uid)
        .set(baseProfile);

      // Create role-specific profile
      if (userInfo.role === 'patient') {
        await FirebaseFirestore()
          .collection(Collections.PATIENTS)
          .doc(uid)
          .set({
            ...userInfo,
            medicalHistory: [],
            emergencyContact: '',
            assignedDoctors: [],
            linkedDoctorIds: [],
            primaryDoctorId: null,
          });
      } else if (userInfo.role === 'doctor') {
        await FirebaseFirestore()
          .collection(Collections.DOCTORS)
          .doc(uid)
          .set({
            ...userInfo,
            qualifications: [],
            availableSlots: [],
            linkedPatientIds: [],
          });
      } else if (userInfo.role === 'asha') {
        await FirebaseFirestore()
          .collection(Collections.ASHA_WORKERS)
          .doc(uid)
          .set({
            ...userInfo,
            certifications: [],
            assignedFamilies: [],
            performanceMetrics: {
              visitsCompleted: 0,
              familiesServed: 0,
              referralsMade: 0,
              trainingsAttended: 0
            }
          });
      }
    } catch (error) {
      console.error('Create user profile error:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(uid: string): Promise<FirebaseUser | null> {
    try {
      const userDoc = await FirebaseFirestore()
        .collection(Collections.USERS)
        .doc(uid)
        .get();

      if (userDoc.exists()) {
        return userDoc.data() as FirebaseUser;
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  // Update last login time
  private async updateLastLogin(uid: string) {
    try {
      await FirebaseFirestore()
        .collection(Collections.USERS)
        .doc(uid)
        .update({
          lastLoginAt: new Date()
        });
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return FirebaseAuth().currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return FirebaseAuth().onAuthStateChanged(callback);
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      await FirebaseAuth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<FirebaseUser>) {
    try {
      await FirebaseFirestore()
        .collection(Collections.USERS)
        .doc(uid)
        .update(updates);

      // Update role-specific collection too
      const userProfile = await this.getUserProfile(uid);
      if (userProfile?.role) {
        const roleCollection = userProfile.role === 'patient' ? Collections.PATIENTS :
                             userProfile.role === 'doctor' ? Collections.DOCTORS :
                             Collections.ASHA_WORKERS;
        
        await FirebaseFirestore()
          .collection(roleCollection)
          .doc(uid)
          .update(updates);
      }
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }
}

export default new AuthService();
