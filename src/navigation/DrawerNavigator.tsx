import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AppHeader} from '../components/AppHeader';
import {SideDrawer} from '../components/SideDrawer';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanConnectScreen from '../screens/asha/ScanConnectScreen';
import LiveStreamScreen from '../screens/asha/LiveStreamScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import {palette} from '../theme';

export type DrawerParamList = {
  PatientHome: undefined;
  Profile: undefined;
  ScanConnect: undefined;
  LiveStream: undefined;
  Appointments: undefined;
  Analytics: undefined;
  Pregnancy: undefined;
  Medicine: undefined;
  Emergency: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

type DrawerNavigatorProps = {
  isConnected?: boolean;
  onBandPress?: () => void;
};

export const DrawerNavigator: React.FC<DrawerNavigatorProps> = ({
  isConnected,
  onBandPress,
}) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SideDrawer {...props} isConnected={isConnected} onBandPress={onBandPress} />
      )}
      screenOptions={{
        headerShown: true,
        drawerType: 'slide',
        drawerStyle: {
          width: '85%',
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerActiveTintColor: palette.primary,
        drawerInactiveTintColor: palette.textSecondary,
        header: (props) => (
          <AppHeader
            title={props.options.title || props.route.name}
            showDrawerButton={true}
            isConnected={isConnected}
            onBandPress={onBandPress}
          />
        ),
      }}>
      <Drawer.Screen
        name="PatientHome"
        component={PatientHomeScreen}
        options={{
          title: 'LifeBand Dashboard',
          drawerLabel: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          drawerLabel: 'Profile',
        }}
      />
      <Drawer.Screen
        name="ScanConnect"
        component={ScanConnectScreen}
        options={{
          title: 'Scan & Connect',
          drawerLabel: 'Scan LifeBand',
        }}
      />
      <Drawer.Screen
        name="LiveStream"
        component={LiveStreamScreen}
        options={{
          title: 'Live Stream',
          drawerLabel: 'Live Stream',
        }}
      />
      <Drawer.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'My Appointments',
          drawerLabel: 'Appointments',
        }}
      />
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Health Analytics',
          drawerLabel: 'Analytics',
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;