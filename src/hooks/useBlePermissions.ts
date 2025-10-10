import {PermissionsAndroid, Platform} from 'react-native';

const ANDROID_TIRAMISU = 33;
const ANDROID_S = 31;

export const requestBlePermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  type AndroidPermission =
    (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS];

  const permissions: AndroidPermission[] = [];

  if (Platform.Version >= ANDROID_S) {
    permissions.push(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    );
  } else {
    permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  }

  if (Platform.Version >= ANDROID_TIRAMISU) {
    permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  const results = await PermissionsAndroid.requestMultiple(permissions);

  return permissions.every(
    perm => results[perm] === PermissionsAndroid.RESULTS.GRANTED,
  );
};
