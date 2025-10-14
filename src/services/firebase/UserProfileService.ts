import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { UserRole } from '../../types/models';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  organisation?: string;
  staffId?: string;
  // Patient specific
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  // Doctor specific
  licenseNumber?: string;
  specialization?: string;
  // ASHA specific
  workArea?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

class UserProfileService {
  static async createUserProfile(userProfile: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>) {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const now = new Date().toISOString();
      const profileData: UserProfile = {
        ...userProfile,
        uid: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      };

      // Store in users collection
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .set(profileData);

      console.log('User profile created successfully:', profileData.role);
      return profileData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(uid?: string): Promise<UserProfile | null> {
    try {
      const userId = uid || auth().currentUser?.uid;
      if (!userId) {
        throw new Error('No user ID provided');
      }

      const userDoc = await firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(updates: Partial<UserProfile>) {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update(updateData);

      console.log('User profile updated successfully');
      return updateData;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async checkUserByEmail(email: string) {
    try {
      const querySnapshot = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error checking user by email:', error);
      return null;
    }
  }
}

export default UserProfileService;