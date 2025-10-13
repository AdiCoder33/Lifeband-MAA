import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'ASHA' | 'Doctor' | 'Patient';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role?: UserRole;
  name?: string;
  identifier?: string;
  email?: string;
};

type AuthAction =
  | {
      type: 'LOGIN';
      payload: {name: string; identifier: string; email?: string; role?: UserRole};
    }
  | {type: 'SET_ROLE'; payload: UserRole}
  | {type: 'RESTORE_AUTH'; payload: AuthState}
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'LOGOUT'};

type LoginPayload = {name: string; identifier: string; email?: string; role?: UserRole};
type RegisterPayload = {
  name: string;
  email: string;
  identifier?: string;
  password?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role?: UserRole;
  name?: string;
  identifier?: string;
  email?: string;
  login: (payload: LoginPayload) => void;
  register: (payload: RegisterPayload) => void;
  loginWithGoogle: () => void;
  selectRole: (role: UserRole) => void;
  logout: () => void;
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
      return {...initialState, isLoading: false};
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted auth state on app start for persistent login
  useEffect(() => {
    const loadAuthState = async () => {
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
            role: savedRole ? (savedRole as UserRole) : undefined
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

  const loginWithGoogle = useCallback(() => {
    dispatch({
      type: 'LOGIN',
      payload: {
        name: 'LifeBand User',
        email: 'lifeband.user@example.com',
        identifier: 'GOOGLE_USER',
      },
    });
  }, []);

  const selectRole = useCallback(async (role: UserRole) => {
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
    } catch (error) {
      console.log('Failed to clear auth state:', error);
    }
    dispatch({type: 'LOGOUT'});
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      role: state.role,
      name: state.name,
      identifier: state.identifier,
      login,
      register,
      loginWithGoogle,
      selectRole,
      logout,
    }),
    [
      login,
      loginWithGoogle,
      logout,
      register,
      selectRole,
      state.email,
      state.identifier,
      state.isAuthenticated,
      state.name,
      state.role,
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
