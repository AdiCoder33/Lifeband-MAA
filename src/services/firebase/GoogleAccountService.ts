import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import GoogleAuthService from './googleAuth';

class GoogleAccountService {
  static async showGoogleAccounts() {
    try {
      await GoogleAuthService.configure();
      
      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get user info from Google (this will show account picker)
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.user?.email) {
        throw new Error('No email received from Google');
      }

      return {
        email: userInfo.data.user.email,
        name: userInfo.data.user.name,
        photo: userInfo.data.user.photo,
        googleUserInfo: userInfo.data.user,
        idToken: userInfo.data.idToken
      };
    } catch (error: any) {
      console.error('Google Account Selection Error:', error);
      throw error;
    }
  }

  static async checkIfUserRegistered(email: string) {
    try {
      console.log('Checking user registration for:', email);
      
      // Check if user has completed profile in Firestore with retry logic
      let userDoc;
      let retries = 3;
      
      while (retries > 0) {
        try {
          userDoc = await firestore()
            .collection('users')
            .where('email', '==', email)
            .get();
          break;
        } catch (error: any) {
          console.log(`Firestore attempt failed, ${retries - 1} retries left:`, error.code);
          if (retries === 1) throw error;
          retries--;
          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (userDoc && !userDoc.empty) {
        const userData = userDoc.docs[0].data();
        
        // Check if essential fields are complete
        const hasRequiredFields = userData.role && 
                                userData.name && 
                                userData.phoneNumber;
        
        // Check role-specific required fields
        let hasRoleSpecificFields = true;
        if (userData.role === 'patient') {
          hasRoleSpecificFields = userData.dateOfBirth && userData.emergencyContact;
        } else if (userData.role === 'doctor') {
          hasRoleSpecificFields = userData.licenseNumber && userData.specialization;
        } else if (userData.role === 'asha') {
          hasRoleSpecificFields = userData.workArea;
        }

        return {
          isRegistered: true,
          hasCompleteProfile: hasRequiredFields && hasRoleSpecificFields,
          hasPartialProfile: hasRequiredFields && !hasRoleSpecificFields,
          role: userData.role,
          userData: userData,
          missingFields: this.getMissingFields(userData)
        };
      }

      return {
        isRegistered: false,
        hasCompleteProfile: false,
        hasPartialProfile: false,
        role: null,
        userData: null,
        missingFields: []
      };
    } catch (error: any) {
      console.error('Error checking user registration:', error);
      
      // If Firestore is unavailable, we'll treat as new user and let them register
      // This ensures Google Sign-In still works even with network issues
      if (error.code === 'firestore/unavailable' || error.code === 'firestore/deadline-exceeded') {
        console.log('Firestore unavailable, treating as new user for now');
        return {
          isRegistered: false,
          hasCompleteProfile: false,
          hasPartialProfile: false,
          role: null,
          userData: null,
          missingFields: [],
          firestoreError: true
        };
      }
      
      return {
        isRegistered: false,
        hasCompleteProfile: false,
        hasPartialProfile: false,
        role: null,
        userData: null,
        missingFields: [],
        firestoreError: true
      };
    }
  }

  static getMissingFields(userData: any) {
    const missing = [];
    
    // Basic fields
    if (!userData.name) missing.push('name');
    if (!userData.phoneNumber) missing.push('phoneNumber');
    if (!userData.role) missing.push('role');
    
    // Role-specific fields
    if (userData.role === 'patient') {
      if (!userData.dateOfBirth) missing.push('dateOfBirth');
      if (!userData.emergencyContact) missing.push('emergencyContact');
    } else if (userData.role === 'doctor') {
      if (!userData.licenseNumber) missing.push('licenseNumber');
      if (!userData.specialization) missing.push('specialization');
    } else if (userData.role === 'asha') {
      if (!userData.workArea) missing.push('workArea');
    }
    
    return missing;
  }

  static async signInExistingGoogleUser(idToken: string) {
    try {
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      return userCredential.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }
}

export default GoogleAccountService;