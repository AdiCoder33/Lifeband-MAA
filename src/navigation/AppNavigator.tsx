import React, {useMemo} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth, type UserRole} from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanConnectScreen from '../screens/asha/ScanConnectScreen';
import LiveStreamScreen from '../screens/asha/LiveStreamScreen';
import DoctorNavigator from './DoctorNavigator';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import {palette} from '../theme';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  RoleSelection: undefined;
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

const PatientNavigator = () => (
  <PatientStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: {backgroundColor: palette.background},
    }}>
    <PatientStack.Screen name="PatientHome" component={PatientHomeScreen} />
    <PatientStack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
  </PatientStack.Navigator>
);

const roleToComponent: Record<UserRole, React.FC> = {
  ASHA: AshaNavigator,
  Doctor: DoctorNavigator,
  Patient: PatientNavigator,
};

const MainSwitch: React.FC = () => {
  const {role} = useAuth();
  if (!role) {
    return null;
  }
  const Component = roleToComponent[role];
  return <Component />;
};

export const AppNavigator: React.FC = () => {
  const {isAuthenticated, role} = useAuth();
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
        ) : !role ? (
          <RootStack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
          />
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
