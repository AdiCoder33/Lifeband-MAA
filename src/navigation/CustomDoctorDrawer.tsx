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
import {DoctorSideDrawer} from '../components/DoctorSideDrawer';
import DoctorOverviewScreen from '../screens/doctor/DoctorOverviewScreen';
import PatientDetailScreen from '../screens/doctor/PatientDetailScreen';
import PatientManagementScreen from '../screens/doctor/PatientManagementScreen';
import DoctorAnalyticsScreen from '../screens/doctor/DoctorAnalyticsScreen';
import DoctorScheduleScreen from '../screens/doctor/DoctorScheduleScreen';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {useAuth} from '../context/AuthContext';
import {palette} from '../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

export type DoctorDrawerParamList = {
  DoctorOverview: undefined;
  PatientDetail: {patientId: string};
  PatientManagement: undefined;
  DoctorAnalytics: undefined;
  DoctorSchedule: undefined;
  DoctorAppointments: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<DoctorDrawerParamList>();

type CustomDoctorDrawerProps = {
  isConnected?: boolean;
  onBandPress?: () => void;
};

export const CustomDoctorDrawer: React.FC<CustomDoctorDrawerProps> = ({
  isConnected,
  onBandPress,
}) => {
  const {name} = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('DoctorOverview');
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
    onPanResponderGrant: () => {
      // Reset animations
    },
    onPanResponderRelease: () => {
      // Handle release
    },
  });

  useEffect(() => {
    // Listen for navigation state changes to update current screen
    // This would be implemented with navigation state listener
  }, []);

  const getScreenTitle = () => {
    const doctorName = name ? `Dr. ${name.split(' ')[0]}` : 'Dr. User';
    
    switch (currentScreen) {
      case 'DoctorOverview':
        return `Welcome, ${doctorName}`;
      case 'PatientManagement':
        return 'Patient Management';
      case 'DoctorAnalytics':
        return 'Medical Analytics';
      case 'DoctorSchedule':
        return 'My Schedule';
      case 'DoctorAppointments':
        return 'Appointments';
      case 'PatientDetail':
        return 'Patient Details';
      case 'Profile':
        return 'My Profile';
      default:
        return `Welcome, ${doctorName}`;
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
          name="DoctorOverview"
          component={DoctorOverviewScreen}
        />
        <Stack.Screen
          name="PatientDetail"
          component={PatientDetailScreen}
        />
        <Stack.Screen
          name="PatientManagement"
          component={PatientManagementScreen}
        />
        <Stack.Screen
          name="DoctorAnalytics"
          component={DoctorAnalyticsScreen}
        />
        <Stack.Screen
          name="DoctorSchedule"
          component={DoctorScheduleScreen}
        />
        <Stack.Screen
          name="DoctorAppointments"
          component={DoctorAppointmentsScreen}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
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
            <DoctorSideDrawer 
              onClose={closeDrawer}
              onNavigate={(screen: string) => setCurrentScreen(screen)}
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
    backgroundColor: palette.card,
    zIndex: 1001,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default CustomDoctorDrawer;