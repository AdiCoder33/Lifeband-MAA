import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService, { FirebaseUser } from '../services/firebase/auth';
import GoogleAuthService, { GoogleSignInResult } from '../services/firebase/googleAuth';
import UserProfileService, { UserProfile } from '../services/firebase/UserProfileService';
import { User } from '../services/firebase/config';
import { UserRole } from '../types/models';

export type LegacyUserRole = 'ASHA' | 'Doctor' | 'Patient';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role?: LegacyUserRole;
  name?: string;
  identifier?: string;
  email?: string;
  user?: User | null;
  firebaseProfile?: FirebaseUser | null;
  // Google Sign-In states
  googleUser?: User | null;
  googleUserInfo?: any;
  needsRegistration?: boolean;
};

type AuthAction =
  | {
      type: 'LOGIN';
      payload: {name: string; identifier: string; email?: string; role?: LegacyUserRole};
    }
  | {type: 'FIREBASE_LOGIN'; payload: {user: User; profile: FirebaseUser}}
  | {type: 'GOOGLE_LOGIN'; payload: {user: User; profile: UserProfile}}
  | {type: 'GOOGLE_NEEDS_REGISTRATION'; payload: {user: User; googleUserInfo: any}}
  | {type: 'SET_ROLE'; payload: LegacyUserRole}
  | {type: 'RESTORE_AUTH'; payload: AuthState}
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'LOGOUT'};

type LoginPayload = {name: string; identifier: string; email?: string; role?: LegacyUserRole};
type RegisterPayload = {
  name: string;
  email: string;
  identifier?: string;
  password?: string;
  role?: UserRole; // Firebase role format
};

// Role conversion utilities
const convertToLegacyRole = (role: UserRole): LegacyUserRole => {
  switch (role) {
    case 'patient': return 'Patient';
    case 'doctor': return 'Doctor';
    case 'asha': return 'ASHA';
  }
};

const convertToFirebaseRole = (role: LegacyUserRole): UserRole => {
  switch (role) {
    case 'Patient': return 'patient';
    case 'Doctor': return 'doctor';
    case 'ASHA': return 'asha';
  }
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role?: LegacyUserRole;
  name?: string;
  identifier?: string;
  email?: string;
  user?: User | null;
  firebaseProfile?: FirebaseUser | null;
  // Google Sign-In states
  googleUser?: User | null;
  googleUserInfo?: any;
  needsRegistration?: boolean;
  // Auth methods
  login: (payload: LoginPayload) => void;
  register: (payload: RegisterPayload) => void;
  loginWithGoogle: () => Promise<void>;
  completeGoogleRegistration: (userInfo: {
    name?: string;
    role: UserProfile['role'];
    phoneNumber?: string;
    organisation?: string;
    staffId?: string;
  }) => Promise<void>;
  selectRole: (role: LegacyUserRole) => void;
  logout: () => void;
  // Firebase methods
  signInWithFirebase: (email: string, password: string) => Promise<void>;
  signUpWithFirebase: (email: string, password: string, userInfo: Omit<FirebaseUser, 'uid' | 'email' | 'createdAt' | 'lastLoginAt' | 'isActive'>) => Promise<void>;
};

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
};

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        name: action.payload.name,
        identifier: action.payload.identifier,
        email: action.payload.email,
        role: action.payload.role,
        needsRegistration: false,
      };
    case 'FIREBASE_LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        firebaseProfile: action.payload.profile,
        name: action.payload.profile.name,
        email: action.payload.profile.email,
        role: convertToLegacyRole(action.payload.profile.role),
        needsRegistration: false,
      };
    case 'GOOGLE_LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        name: action.payload.profile.name,
        email: action.payload.profile.email,
        role: convertToLegacyRole(action.payload.profile.role),
        needsRegistration: false,
      };
    case 'GOOGLE_NEEDS_REGISTRATION':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        googleUser: action.payload.user,
        googleUserInfo: action.payload.googleUserInfo,
        needsRegistration: true,
      };
    case 'SET_ROLE':
      return {
        ...state,
        role: action.payload,
      };
    case 'RESTORE_AUTH':
      return {...action.payload, isLoading: false};
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState, 
        isLoading: false,
        googleUser: null,
        googleUserInfo: null,
        needsRegistration: false
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Firebase authentication listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await AuthService.getUserProfile(user.uid);
          if (profile) {
            dispatch({
              type: 'FIREBASE_LOGIN',
              payload: { user, profile }
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        // Load persisted legacy auth state if no Firebase user
        try {
          const authData = await AsyncStorage.getItem('authState');
          if (authData) {
            const parsedAuth = JSON.parse(authData);
            dispatch({type: 'RESTORE_AUTH', payload: parsedAuth});
          } else {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        } catch (error) {
          console.log('Failed to load auth state:', error);
          dispatch({type: 'SET_LOADING', payload: false});
        }
      }
    });

    return unsubscribe;
  }, []);

  // Legacy load persisted auth state on app start
  useEffect(() => {
    const loadAuthState = async () => {
      // Only load legacy auth if no Firebase user is logged in
      if (!AuthService.getCurrentUser()) {
        try {
          const authData = await AsyncStorage.getItem('authState');
          if (authData) {
            const parsedAuth = JSON.parse(authData);
            dispatch({type: 'RESTORE_AUTH', payload: parsedAuth});
          } else {
            dispatch({type: 'SET_LOADING', payload: false});
          }
        } catch (error) {
          console.log('Failed to load auth state:', error);
          dispatch({type: 'SET_LOADING', payload: false});
        }
      }
    };
    loadAuthState();
  }, []);

  // Save auth state whenever it changes
  useEffect(() => {
    const saveAuthState = async () => {
      try {
        await AsyncStorage.setItem('authState', JSON.stringify(state));
      } catch (error) {
        console.log('Failed to save auth state:', error);
      }
    };
    
    if (state.isAuthenticated) {
      saveAuthState();
    }
  }, [state]);

  // Helpers for per-Google-account role persistence
  const getRoleForGoogleEmail = async (email: string): Promise<LegacyUserRole | null> => {
    try {
      const v = await AsyncStorage.getItem(`googleRole_${email}`);
      return v as LegacyUserRole | null;
    } catch (e) {
      return null;
    }
  };

  const setRoleForGoogleEmail = async (email: string, role: LegacyUserRole) => {
    try {
      await AsyncStorage.setItem(`googleRole_${email}`, role);
    } catch (e) {
      console.log('Failed to set google role', e);
    }
  };

  const login = useCallback(
    async ({name, identifier, email, role}: LoginPayload) => {
      // If role is provided, use it directly and save it
      if (role) {
        try {
          await AsyncStorage.setItem(`userRole_${identifier}`, role);
        } catch (error) {
          console.log('Failed to save user role:', error);
        }
        dispatch({
          type: 'LOGIN', 
          payload: {name, identifier, email, role}
        });
        return;
      }

      // Otherwise, check if user already has a saved role
      try {
        const savedRole = await AsyncStorage.getItem(`userRole_${identifier}`);
        dispatch({
          type: 'LOGIN', 
          payload: {
            name, 
            identifier, 
            email,
            role: savedRole ? (savedRole as LegacyUserRole) : undefined
          }
        });
      } catch (error) {
        dispatch({type: 'LOGIN', payload: {name, identifier, email}});
      }
    },
    [],
  );

  const register = useCallback(
    ({name, email, identifier}: RegisterPayload) => {
      dispatch({
        type: 'LOGIN',
        payload: {
          name,
          email,
          identifier: identifier ?? email,
        },
      });
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});

  const result: GoogleSignInResult = await GoogleAuthService.signIn({ forceAccountSelection: true });

      // If we have an account email, try to load a stored role for it
      const accountEmail = result.accountEmail || result.googleUserInfo?.email || result.user?.email;
      if (accountEmail) {
        const storedRole = await getRoleForGoogleEmail(accountEmail);
        if (storedRole && result.existingProfile) {
          // Apply stored role and login
          dispatch({
            type: 'GOOGLE_LOGIN',
            payload: { user: result.user, profile: result.existingProfile }
          });
          dispatch({ type: 'SET_ROLE', payload: storedRole });
          dispatch({type: 'SET_LOADING', payload: false});
          return;
        }
      }

      if (result.isNewUser) {
        // Ask user to complete registration
        dispatch({
          type: 'GOOGLE_NEEDS_REGISTRATION',
          payload: { user: result.user, googleUserInfo: result.googleUserInfo }
        });
      } else if (result.existingProfile) {
        dispatch({
          type: 'GOOGLE_LOGIN',
          payload: { user: result.user, profile: result.existingProfile }
        });
      }
      dispatch({type: 'SET_LOADING', payload: false});
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      dispatch({type: 'SET_LOADING', payload: false});
      throw error;
    }
  }, []);

  const completeGoogleRegistration = useCallback(async (userInfo: {
    name?: string;
    role: UserProfile['role'];
    phoneNumber?: string;
    organisation?: string;
    staffId?: string;
  }) => {
    try {
      if (!state.googleUser) {
        throw new Error('No Google user found for registration');
      }

      dispatch({type: 'SET_LOADING', payload: true});
      
      const profile = await GoogleAuthService.completeUserProfile(state.googleUser, userInfo);
      
      dispatch({
        type: 'GOOGLE_LOGIN',
        payload: {
          user: state.googleUser,
          profile: profile
        }
      });
      // Persist the chosen role for this Google account email
      const email = state.googleUser.email;
      if (email && userInfo.role) {
        // convert role (firebase role is 'patient' | 'doctor' | 'asha') to Legacy names
        const legacyRole = convertToLegacyRole(userInfo.role as UserRole);
        if (legacyRole) {
          await setRoleForGoogleEmail(email, legacyRole);
          dispatch({ type: 'SET_ROLE', payload: legacyRole });
        }
      }
    } catch (error) {
      console.error('Complete Google Registration Error:', error);
      dispatch({type: 'SET_LOADING', payload: false});
      throw error;
    }
  }, [state.googleUser]);

  const selectRole = useCallback(async (role: LegacyUserRole) => {
    // Save role permanently for this user
    if (state.identifier) {
      try {
        await AsyncStorage.setItem(`userRole_${state.identifier}`, role);
      } catch (error) {
        console.log('Failed to save user role:', error);
      }
    }
    dispatch({type: 'SET_ROLE', payload: role});
  }, [state.identifier]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('authState');
      // Sign out from Firebase if user is signed in
      if (AuthService.getCurrentUser()) {
        await AuthService.signOut();
      }
    } catch (error) {
      console.log('Failed to clear auth state:', error);
    }
    dispatch({type: 'LOGOUT'});
  }, []);

  // Firebase authentication methods
  const signInWithFirebase = useCallback(async (email: string, password: string) => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      const user = await AuthService.signIn(email, password);
      const profile = await AuthService.getUserProfile(user.uid);
      
      if (profile) {
        dispatch({
          type: 'FIREBASE_LOGIN',
          payload: { user, profile }
        });
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      dispatch({type: 'SET_LOADING', payload: false});
      throw error;
    }
  }, []);

  const signUpWithFirebase = useCallback(async (
    email: string, 
    password: string, 
    userInfo: Omit<FirebaseUser, 'uid' | 'email' | 'createdAt' | 'lastLoginAt' | 'isActive'>
  ) => {
    try {
      dispatch({type: 'SET_LOADING', payload: true});
      const user = await AuthService.signUp(email, password, userInfo);
      const profile = await AuthService.getUserProfile(user.uid);
      
      if (profile) {
        dispatch({
          type: 'FIREBASE_LOGIN',
          payload: { user, profile }
        });
      } else {
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      dispatch({type: 'SET_LOADING', payload: false});
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      role: state.role,
      name: state.name,
      identifier: state.identifier,
      email: state.email,
      user: state.user,
      firebaseProfile: state.firebaseProfile,
      googleUser: state.googleUser,
      googleUserInfo: state.googleUserInfo,
      needsRegistration: state.needsRegistration,
      login,
      register,
      loginWithGoogle,
      completeGoogleRegistration,
      selectRole,
      logout,
      signInWithFirebase,
      signUpWithFirebase,
    }),
    [
      login,
      loginWithGoogle,
      completeGoogleRegistration,
      logout,
      register,
      selectRole,
      signInWithFirebase,
      signUpWithFirebase,
      state.email,
      state.identifier,
      state.isAuthenticated,
      state.isLoading,
      state.name,
      state.role,
      state.user,
      state.firebaseProfile,
      state.googleUser,
      state.googleUserInfo,
      state.needsRegistration,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
