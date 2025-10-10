import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth, type UserRole} from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import ScanConnectScreen from '../screens/asha/ScanConnectScreen';
import LiveStreamScreen from '../screens/asha/LiveStreamScreen';
import DoctorNavigator from './DoctorNavigator';
import PatientHomeScreen from '../screens/PatientHomeScreen';

export type RootStackParamList = {
  Login: undefined;
  RoleSelection: undefined;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const Tab = createBottomTabNavigator();

const AshaTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShadowVisible: false,
      tabBarActiveTintColor: '#1A73E8',
      tabBarInactiveTintColor: '#5F6368',
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

const roleToComponent: Record<UserRole, React.FC> = {
  ASHA: AshaTabs,
  Doctor: DoctorNavigator,
  Patient: PatientHomeScreen,
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

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : !role ? (
          <RootStack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
          />
        ) : (
          <RootStack.Screen name="Main" component={MainSwitch} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
