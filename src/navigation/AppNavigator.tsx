import React, {useMemo, useState} from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '../context/AuthContext';
import {UserRole} from '../types/models';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import ProfileScreen from '../screens/ProfileScreen';
import ScanConnectScreen from '../screens/asha/ScanConnectScreen';
import LiveStreamScreen from '../screens/asha/LiveStreamScreen';
import DoctorNavigator from './DoctorNavigator';
import CustomDoctorDrawer from './CustomDoctorDrawer';
import CustomAshaDrawer from './CustomAshaDrawer';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import CustomDrawer from './CustomDrawer';
import {palette} from '../theme';

export type RootStackParamList = {
  Login: undefined;
  Register: {
    googleUserInfo?: {
      email: string;
      name: string;
      photo?: string;
      idToken?: string;
    };
    isGoogleSignUp?: boolean;
    existingUserData?: any;
    missingFields?: string[];
  } | undefined;
  Main: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const Tab = createBottomTabNavigator();
const AshaStack = createNativeStackNavigator();
const PatientStack = createNativeStackNavigator();

const AshaTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      headerShadowVisible: false,
      tabBarActiveTintColor: palette.primary,
      tabBarInactiveTintColor: palette.textSecondary,
      tabBarStyle: {
        backgroundColor: palette.surface,
        borderTopColor: 'transparent',
        height: 70,
        paddingBottom: 10,
      },
      tabBarLabelStyle: {
        fontWeight: '600',
      },
    }}>
    <Tab.Screen
      name="ScanConnect"
      component={ScanConnectScreen}
      options={{
        title: 'Scan',
        tabBarLabel: 'Scan',
      }}
    />
    <Tab.Screen
      name="LiveStream"
      component={LiveStreamScreen}
      options={{
        title: 'Live Stream',
        tabBarLabel: 'Live',
      }}
    />
  </Tab.Navigator>
);

const AshaNavigator = () => (
  <AshaStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: {backgroundColor: palette.background},
    }}>
    <AshaStack.Screen name="AshaTabs" component={AshaTabs} />
    <AshaStack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
  </AshaStack.Navigator>
);

const PatientNavigator = () => {
  const [isConnected, setIsConnected] = useState(false);

  const handleBandPress = () => {
    // Handle band connection/scan logic
    setIsConnected(!isConnected);
  };

  return (
    <CustomDrawer 
      isConnected={isConnected} 
      onBandPress={handleBandPress} 
    />
  );
};

const roleToComponent: Record<UserRole, React.FC> = {
  asha: CustomAshaDrawer,
  doctor: CustomDoctorDrawer,
  patient: PatientNavigator,
};

// Convert legacy role format to new format
const convertRole = (legacyRole: string): UserRole => {
  switch (legacyRole) {
    case 'ASHA':
      return 'asha';
    case 'Doctor':
      return 'doctor';
    case 'Patient':
      return 'patient';
    default:
      return 'patient'; // Default fallback
  }
};

const MainSwitch: React.FC = () => {
  const {role, logout} = useAuth();
  
  if (!role) {
    // If authenticated but no role, there's an issue - logout and redirect to login
    console.log('MainSwitch: User is authenticated but has no role - forcing logout');
    logout();
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background}}>
        <Text style={{color: palette.textPrimary, fontSize: 16}}>Redirecting to login...</Text>
      </View>
    );
  }
  
  const normalizedRole = convertRole(role);
  const Component = roleToComponent[normalizedRole];
  return <Component />;
};

export const AppNavigator: React.FC = () => {
  const {isAuthenticated, role, isLoading} = useAuth();
  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.surface,
        text: palette.textPrimary,
        border: palette.border,
        notification: palette.primaryLight,
      },
    }),
    [],
  );

  // Show loading screen while authentication is being determined
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background}}>
        <Text style={{color: palette.textPrimary, fontSize: 16}}>Checking authentication...</Text>
      </View>
    );
  }

  console.log('AppNavigator - isAuthenticated:', isAuthenticated, 'role:', role, 'isLoading:', isLoading);

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: palette.background},
        }}>
        {!isAuthenticated ? (
          <>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen
              name="Register"
              component={RegisterScreen}
              options={{presentation: 'card'}}
            />
          </>
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainSwitch} />
            <RootStack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
