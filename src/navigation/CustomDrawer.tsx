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
import {SideDrawer} from '../components/SideDrawer';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanConnectScreen from '../screens/asha/ScanConnectScreen';
import LiveStreamScreen from '../screens/asha/LiveStreamScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import MedicineTrackerScreen from '../screens/maternal/MedicineTrackerScreen';
import NutritionGuideScreen from '../screens/maternal/NutritionGuideScreen';
import PrenatalExerciseScreen from '../screens/maternal/PrenatalExerciseScreen';
import BabyDevelopmentScreen from '../screens/maternal/BabyDevelopmentScreen';
import EmergencyContactsScreen from '../screens/maternal/EmergencyContactsScreen';
import {useAuth} from '../context/AuthContext';
import {palette} from '../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

export type DrawerParamList = {
  PatientHome: undefined;
  Profile: undefined;
  ScanConnect: undefined;
  LiveStream: undefined;
  Analytics: undefined;
  Settings: undefined;
  Appointments: undefined;
  MedicineTracker: undefined;
  NutritionGuide: undefined;
  PrenatalExercise: undefined;
  BabyDevelopment: undefined;
  EmergencyContacts: undefined;
};

const Stack = createNativeStackNavigator<DrawerParamList>();

type CustomDrawerProps = {
  isConnected?: boolean;
  onBandPress?: () => void;
};

export const CustomDrawer: React.FC<CustomDrawerProps> = ({
  isConnected,
  onBandPress,
}) => {
  const {name} = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('PatientHome');
  const [slideAnim] = useState(new Animated.Value(0));
  const [overlayOpacity] = useState(new Animated.Value(0));

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDrawerOpen(false);
    });
  };

  // Pan responder for swipe gesture
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only respond to horizontal swipes from the left edge
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        gestureState.dx > 0 && // Right swipe only
        gestureState.moveX < SCREEN_WIDTH / 2 // From left half of screen
      );
    },
    onPanResponderMove: (_, gestureState) => {
      // Open drawer if swiping right from left side
      if (gestureState.dx > 50 && !isDrawerOpen) {
        openDrawer();
      }
    },
    onPanResponderRelease: () => {
      // Handle gesture end if needed
    },
  });

  const getScreenTitle = () => {
    const userName = name ? name.split(' ')[0] : 'User';
    
    switch (currentScreen) {
      case 'PatientHome':
        return `Welcome, ${userName}`;
      case 'Profile':
        return 'My Profile';
      case 'Analytics':
        return 'Health Analytics';
      case 'Settings':
        return 'Settings';
      case 'Appointments':
        return 'My Appointments';
      case 'ScanConnect':
        return 'Scan & Connect';
      case 'LiveStream':
        return 'Live Stream';
      case 'MedicineTracker':
        return 'Medicine Tracker';
      case 'NutritionGuide':
        return 'Nutrition Guide';
      case 'PrenatalExercise':
        return 'Prenatal Exercise';
      case 'BabyDevelopment':
        return 'Baby Development';
      case 'EmergencyContacts':
        return 'Emergency Contacts';
      default:
        return `Welcome, ${userName}`;
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <AppHeader
        title={getScreenTitle()}
        showDrawerButton={true}
        isConnected={isConnected}
        onBandPress={onBandPress}
        onDrawerPress={openDrawer}
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="PatientHome"
          component={PatientHomeScreen}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
        />
        <Stack.Screen
          name="ScanConnect"
          component={ScanConnectScreen}
        />
        <Stack.Screen
          name="LiveStream"
          component={LiveStreamScreen}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />
        <Stack.Screen
          name="Appointments"
          component={AppointmentsScreen}
        />
        <Stack.Screen
          name="MedicineTracker"
          component={MedicineTrackerScreen}
        />
        <Stack.Screen
          name="NutritionGuide"
          component={NutritionGuideScreen}
        />
        <Stack.Screen
          name="PrenatalExercise"
          component={PrenatalExerciseScreen}
        />
        <Stack.Screen
          name="BabyDevelopment"
          component={BabyDevelopmentScreen}
        />
        <Stack.Screen
          name="EmergencyContacts"
          component={EmergencyContactsScreen}
        />
      </Stack.Navigator>

      {/* Drawer Overlay and Content */}
      {isDrawerOpen && (
        <>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}>
            <TouchableOpacity
              style={styles.overlayTouch}
              onPress={closeDrawer}
              activeOpacity={1}
            />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-DRAWER_WIDTH, 0],
                    }),
                  },
                ],
              },
            ]}>
            <SideDrawer
              isConnected={isConnected}
              onBandPress={onBandPress}
              onClose={closeDrawer}
              onNavigate={setCurrentScreen}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  overlayTouch: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: palette.surface,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default CustomDrawer;