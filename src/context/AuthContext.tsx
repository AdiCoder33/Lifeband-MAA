import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

export type UserRole = 'ASHA' | 'Doctor' | 'Patient';

type AuthState = {
  isAuthenticated: boolean;
  role?: UserRole;
  name?: string;
  identifier?: string;
};

type AuthAction =
  | {type: 'LOGIN'; payload: {name: string; identifier: string}}
  | {type: 'SET_ROLE'; payload: UserRole}
  | {type: 'LOGOUT'};

type LoginPayload = {name: string; identifier: string};

type AuthContextValue = {
  isAuthenticated: boolean;
  role?: UserRole;
  name?: string;
  identifier?: string;
  login: (payload: LoginPayload) => void;
  selectRole: (role: UserRole) => void;
  logout: () => void;
};

const initialState: AuthState = {
  isAuthenticated: false,
};

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        name: action.payload.name,
        identifier: action.payload.identifier,
      };
    case 'SET_ROLE':
      return {
        ...state,
        role: action.payload,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = useCallback(({name, identifier}: LoginPayload) => {
    dispatch({type: 'LOGIN', payload: {name, identifier}});
  }, []);

  const selectRole = useCallback((role: UserRole) => {
    dispatch({type: 'SET_ROLE', payload: role});
  }, []);

  const logout = useCallback(() => {
    dispatch({type: 'LOGOUT'});
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: state.isAuthenticated,
      role: state.role,
      name: state.name,
      identifier: state.identifier,
      login,
      selectRole,
      logout,
    }),
    [login, logout, selectRole, state.identifier, state.isAuthenticated, state.name, state.role],
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
