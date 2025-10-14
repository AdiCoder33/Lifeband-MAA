import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AppHeader} from '../components/AppHeader';
import AshaSideDrawer from '../components/AshaSideDrawer';
import ScanConnectScreen from '../screens/asha/ScanConnectScreen';
import LiveStreamScreen from '../screens/asha/LiveStreamScreen';
import MaternalVisitsScreen from '../screens/asha/MaternalVisitsScreen';
import HealthEducationScreen from '../screens/asha/HealthEducationScreen';
import VaccinationDriveScreen from '../screens/asha/VaccinationDriveScreen';
import NutritionProgramScreen from '../screens/asha/NutritionProgramScreen';
import BirthRegistrationScreen from '../screens/asha/BirthRegistrationScreen';
import FamilyPlanningScreen from '../screens/asha/FamilyPlanningScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {useAuth} from '../context/AuthContext';
import {palette} from '../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

export type AshaDrawerParamList = {
  ScanConnect: undefined;
  LiveStream: undefined;
  MaternalVisits: undefined;
  HealthEducation: undefined;
  VaccinationDrive: undefined;
  NutritionProgram: undefined;
  BirthRegistration: undefined;
  FamilyPlanning: undefined;
  PatientRecords: undefined;
  HealthSurveys: undefined;
  ReferralTracking: undefined;
  MedicineDistribution: undefined;
  AshaPerformance: undefined;
  CommunityStats: undefined;
  AshaSettings: undefined;
  Training: undefined;
  Support: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AshaDrawerParamList>();

type CustomAshaDrawerProps = {
  isConnected?: boolean;
  onBandPress?: () => void;
};

const CustomAshaDrawer: React.FC<CustomAshaDrawerProps> = ({
  isConnected = false,
  onBandPress,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [translateX] = useState(new Animated.Value(-DRAWER_WIDTH));
  const {role} = useAuth();

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0 && gestureState.dx <= DRAWER_WIDTH) {
        translateX.setValue(-DRAWER_WIDTH + gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > DRAWER_WIDTH / 3) {
        openDrawer();
      } else {
        closeDrawer();
      }
    },
  });

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleEmergencyProtocol = () => {
    // Emergency protocol logic will be implemented here
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <AppHeader
        title="🏘️ ASHA Community Hub"
        subtitle="Community health monitoring • ASHA Worker"
        rightAccessory={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
              <View style={styles.menuIcon}>
                <View style={[styles.menuLine, styles.menuLineTop]} />
                <View style={[styles.menuLine, styles.menuLineMiddle]} />
                <View style={[styles.menuLine, styles.menuLineBottom]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleEmergencyProtocol}
              style={styles.emergencyButton}>
              <View style={styles.emergencyIcon} />
            </TouchableOpacity>
          </View>
        }
      />
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: palette.background},
        }}>
        <Stack.Screen
          name="ScanConnect"
          component={ScanConnectScreen}
        />
        <Stack.Screen
          name="LiveStream"
          component={LiveStreamScreen}
        />
        <Stack.Screen
          name="MaternalVisits"
          component={MaternalVisitsScreen}
        />
        <Stack.Screen
          name="HealthEducation"
          component={HealthEducationScreen}
        />
        <Stack.Screen
          name="VaccinationDrive"
          component={VaccinationDriveScreen}
        />
        <Stack.Screen
          name="NutritionProgram"
          component={NutritionProgramScreen}
        />
        <Stack.Screen
          name="BirthRegistration"
          component={BirthRegistrationScreen}
        />
        <Stack.Screen
          name="FamilyPlanning"
          component={FamilyPlanningScreen}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
      </Stack.Navigator>

      {/* Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={closeDrawer}
          activeOpacity={1}
        />
      )}

      {/* Side Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{translateX}],
          },
        ]}>
        <AshaSideDrawer onClose={closeDrawer} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  menuIcon: {
    width: 20,
    height: 16,
  },
  menuLine: {
    width: '100%',
    height: 2,
    backgroundColor: palette.primary,
    borderRadius: 1,
  },
  menuLineTop: {
    marginBottom: 4,
  },
  menuLineMiddle: {
    marginBottom: 4,
    width: '80%',
  },
  menuLineBottom: {},
  emergencyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.textOnPrimary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: palette.card,
    zIndex: 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default CustomAshaDrawer;