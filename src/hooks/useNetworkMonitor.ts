import {useEffect} from 'react';
import NetInfo, {type NetInfoState} from '@react-native-community/netinfo';
import {useAppStore} from '../store/useAppStore';

export const useNetworkMonitor = () => {
  const setOffline = useAppStore(state => state.setOffline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setOffline(!(state.isConnected && state.isInternetReachable));
    });
    return () => unsubscribe();
  }, [setOffline]);
};
