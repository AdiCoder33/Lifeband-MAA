import React, {useRef, useState} from 'react';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {palette, spacing} from '../theme';
import AppHeader from './AppHeader';
import AshaSideDrawer from './AshaSideDrawer';

interface CustomAshaDrawerProps {
  children: React.ReactNode;
}

const {width: screenWidth} = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.85;

const CustomAshaDrawer: React.FC<CustomAshaDrawerProps> = ({children}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const gestureRef = useRef(null);

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

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
        },
      },
    ],
    {
      useNativeDriver: true,
    },
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const {translationX} = event.nativeEvent;
      
      if (translationX > DRAWER_WIDTH / 3) {
        openDrawer();
      } else {
        closeDrawer();
      }
    }
  };

  const handleEmergencyProtocol = () => {
    Alert.alert(
      '🚨 Emergency Protocol',
      'Select emergency action:',
      [
        {text: 'Call Emergency Services', onPress: () => Alert.alert('Calling 108 Emergency Services')},
        {text: 'Contact Doctor', onPress: () => Alert.alert('Contacting nearest doctor')},
        {text: 'Ambulance Request', onPress: () => Alert.alert('Requesting ambulance')},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="🏘️ ASHA Community Hub"
        subtitle="Community health monitoring and maternal care"
        rightAccessory={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={openDrawer}
              style={styles.menuButton}>
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleEmergencyProtocol}
              style={styles.emergencyButton}>
              <Text style={styles.emergencyButtonText}>🚨 Emergency</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {children}

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <View style={styles.overlay} onTouchEnd={closeDrawer} />
      )}

      {/* Side Drawer */}
      <PanGestureHandler
        ref={gestureRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{translateX}],
            },
          ]}>
          <AshaSideDrawer onClose={closeDrawer} />
        </Animated.View>
      </PanGestureHandler>
    </SafeAreaView>
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
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  menuButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  emergencyButton: {
    backgroundColor: palette.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  emergencyButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: palette.card,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    zIndex: 999,
  },
});

export default CustomAshaDrawer;