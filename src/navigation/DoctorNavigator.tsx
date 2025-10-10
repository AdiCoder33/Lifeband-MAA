import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import DoctorOverviewScreen from '../screens/doctor/DoctorOverviewScreen';
import PatientDetailScreen from '../screens/doctor/PatientDetailScreen';

export type DoctorStackParamList = {
  DoctorOverview: undefined;
  PatientDetail: {patientId: string};
};

export type DoctorStackScreenProps<T extends keyof DoctorStackParamList> =
  NativeStackScreenProps<DoctorStackParamList, T>;

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export const DoctorNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DoctorOverview"
        component={DoctorOverviewScreen}
        options={{title: 'Doctor'}}
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{title: 'Patient Detail'}}
      />
    </Stack.Navigator>
  );
};

export default DoctorNavigator;
