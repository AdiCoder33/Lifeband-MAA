import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import DoctorOverviewScreen from '../screens/doctor/DoctorOverviewScreen';
import PatientDetailScreen from '../screens/doctor/PatientDetailScreen';
import {palette} from '../theme';

export type DoctorStackParamList = {
  DoctorOverview: undefined;
  PatientDetail: {patientId: string};
};

export type DoctorStackScreenProps<T extends keyof DoctorStackParamList> =
  NativeStackScreenProps<DoctorStackParamList, T>;

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export const DoctorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: palette.background},
      }}>
      <Stack.Screen name="DoctorOverview" component={DoctorOverviewScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
    </Stack.Navigator>
  );
};

export default DoctorNavigator;
