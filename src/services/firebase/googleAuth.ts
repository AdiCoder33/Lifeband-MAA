import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AuthService from './auth';
import UserProfileService, { UserProfile } from './UserProfileService';

export interface GoogleSignInResult {
  user: FirebaseAuthTypes.User;
  googleUserInfo: any;
  isNewUser: boolean;
  existingProfile?: UserProfile;
}

class GoogleAuthService {
  static initialized = false;

  static configure() {
    if (!this.initialized) {
      GoogleSignin.configure({
        webClientId: '280198393441-u1i6o8h56l7gucep2vjp8180j5vo90qk.apps.googleusercontent.com',
        offlineAccess: true,
      });
      this.initialized = true;
    }
  }

  static async signIn(): Promise<GoogleSignInResult> {
    try {
      this.configure();
      
      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get user info from Google
      const userInfo = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }
      
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Check if this user already has a profile in our system
      const existingProfile = await UserProfileService.getUserProfile(userCredential.user.uid);
      
      // Also check by email in case the user signed up with email before
      let profileByEmail = null;
      if (!existingProfile && userCredential.user.email) {
        profileByEmail = await UserProfileService.checkUserByEmail(userCredential.user.email);
      }
      
      const isNewUser = !existingProfile && !profileByEmail;
      
      return {
        user: userCredential.user,
        googleUserInfo: userInfo.data?.user,
        isNewUser,
        existingProfile: existingProfile || profileByEmail || undefined
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Play Services not available');
      } else {
        throw error;
      }
    }
  }

  static async completeUserProfile(
    user: FirebaseAuthTypes.User,
    additionalInfo: {
      name?: string;
      role: UserProfile['role'];
      phoneNumber?: string;
      organisation?: string;
      staffId?: string;
    }
  ): Promise<UserProfile> {
    try {
      if (!user.email) {
        throw new Error('User email is required');
      }

      const profileData = {
        email: user.email,
        name: additionalInfo.name || user.displayName || 'Google User',
        role: additionalInfo.role,
        phoneNumber: additionalInfo.phoneNumber,
        organisation: additionalInfo.organisation,
        staffId: additionalInfo.staffId,
      };

      const userProfile = await UserProfileService.createUserProfile(profileData);
      return userProfile;
    } catch (error) {
      console.error('Error completing user profile:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  }

  static async isSignedIn() {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo !== null;
    } catch (error) {
      return false;
    }
  }
}

export default GoogleAuthService;